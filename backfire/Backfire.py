
import re

def log(msg):
    #print msg.replace("\r\n", "<br />") + "<br />"
    pass

ACCESS_GRANTED = "AccessGranted"
ACCESS_DENIED = "AccessDenied"
SAVE_SUCCESSFUL = "SaveSuccessful"
SAVE_FAILED = "SaveFailed"
LOAD_FAILED = "LoadFailed"

def create_message_for_client(message):
    return '<script>window.parent.postMessage("%s", "*")</script>' % message
    
def process(changes, cssLoader, cssSaver):
    log("changes: %s" % changes);
    return _process(changes, cssLoader, cssSaver)

_uri = ""
_action = ""
_declaration = ""
_value = ""
_uriContents = {}

def _process(changes, cssLoader, cssSaver):
    """Processes the posted changes by going through them sequentially. It builds up a
    dictionary ssLoaderof uri/css-contents key/value pairs. When needed it performs a call
    to cssLoader in order to retrieve the original CSS. When all changes are processed,
    it will make the appropriate calls to the cssSaver."""
    
    global _uri
    global _action
    global _declaration
    global _value
    global _uriContents

    _uri = ""
    _action = ""
    _declaration = ""
    _value = ""    
    _uriContents = {}

    result = SAVE_SUCCESSFUL
    actions = changes.split('\n')
    curUri = ""
    selector = ""

    for line in actions:
        if line == "": 
            continue

        _action = line[0]
        contents = line[2:].strip('\r\n') # strip off u/a/r cmd at front
        pairs = contents.split(":")
        
        if (_action == "u"):
            curUri = contents
            if (curUri not in _uriContents):
                css = cssLoader(curUri)
                if (not css):
                    result = LOAD_FAILED
                    return result

                _uriContents[curUri] = css
                
        elif (_action == "s"):
            selector = contents

        elif (_action == "c" or _action == "r" or _action == "a"):
            _declaration, _value = (pairs[0], pairs[1])
            log("%s %s: %s -> %s" % (selector, _action, 
                                     _declaration, _value))

            # NOTE: css class names have a period, which is a regex special char
            selectorPattern = re.sub(r' ', r'\s+', selector)

            log("process _decl: %s" % _declaration)

            # NOTE: c# version uses SINGLE_LINE flag.  Might need that...                    
            _uriContents[curUri] = re.sub(
                r'((^|\})([\s\n\r]|(/\*.*?\*/))*' + selectorPattern + r'([\s\n\r]|(/\*.*?\*/))*\{)([^\}]*?)([\n\r\s]*\})',
                _replace_css_rule,
                _uriContents[curUri]) 
      
    for uri in _uriContents:
        contents = _uriContents[uri]
        success = cssSaver(uri, contents)
        if (not success):
            result = SAVE_FAILED
            
    return result

def _replace_css_rule(match):
    """Regex MatchEvaluator to replace a css rule with its new contents.
    Used in changing, adding or deleting css declarations."""
            
    log("replace_css_rule")
    log("match: " + match.group(0))
    
    matchTokens = (match.group(1), match.group(7), match.group(8))
    selectorText, declarationText, closingAccolade = matchTokens

    log("replace _decl: %s"%_declaration)
    
    result = ''.join(matchTokens)
    
    # split the entire declaration body in separate declaration/value lines
    decls = declarationText.split(";")
            
    # build up new declaration body
    newDecl = ""
    indentation = "  "
            
    for decl in decls:
        # split name from value

        declPairs = decl.split(":")
        if (len(declPairs) > 1):

            curDeclaration = declPairs[0]
            
            # get the correct indentation based off existing declarations
            indentation = re.sub(r"^(\s*).*$", r"\1", curDeclaration)
                    
            # curValue is everything from the colon. Not declPairs[1] as the value could contain more colons, like in a url
            curValue = decl[(decl.find(":") + 1):];
                    
            # if this is not the declaration we're looking for, use the original decl and move on
            declarationToCheck = re.sub(r"(?i)/\\*.*?\\*/", "", curDeclaration, 0).lower().strip()
            if (declarationToCheck != _declaration.lower().strip()): 
                newDecl += decl + ";";
                continue;
                    
            # otherwise, only act upon a "c" (change) action.
            elif (_action == "c"):
                newValue = re.sub(r"(^\s*).*?(\s*)$", r"\1|\2", curValue).replace("|", _value)
                newDecl += curDeclaration + ":" + newValue + ";"
                log("newDecl: %s" % newDecl)
                        
                # when the action is "r" (remove), do nothing, so the declaration will be removed
                
    if (_action == "a"):
        newDecl += indentation + _declaration + ": " + _value + ";"

    result = selectorText + newDecl + closingAccolade                            
    log("result: " + result)
                            
    return result
