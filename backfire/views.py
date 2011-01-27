# -*- coding: utf-8 -*-
from urlparse import urlparse

from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.http import HttpResponse

from Backfire import *

def _get_file_path( url ):
    return "%s%s"% ( settings.PROJECT_PATH, urlparse(url).path )
    
def cssLoader( url ):
    f = open( _get_file_path(url) , 'r')
    content = f.read()
    f.close()
    return content
    
def cssSaver(uri, contents):
    try:
        f = open( _get_file_path(uri) , 'w')
        f.write(contents)
        f.close()
        return True
    except:
        return False

@staff_member_required
def get_respond(request):
    if request.method == "POST":
        changes = request.POST.get("backfire-changes", False)
        if changes:
            result = process(changes, cssLoader, cssSaver )
            return HttpResponse(create_message_for_client( result ))
            
    return HttpResponse(create_message_for_client( ACCESS_GRANTED ))