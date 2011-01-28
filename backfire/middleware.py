from django.conf import settings
from django.middleware.csrf import get_token

class BackfireMiddleware(object):
    def process_response(self, request, response):
        html = """
    <input type="hidden" name="csrfmiddlewaretoken" value="%s" id="csrftip" />
    <script src="%sbackfire/js/backfire-1.0.js"></script>
	<script src="%sbackfire/js/example.js"></script>
	""" % ( get_token(request), settings.MEDIA_URL, settings.MEDIA_URL )
	
        if request.user.is_staff:
            content = response.content
            index = content.find('</body>')
            if index == -1: return response
            response.content = content[:index] + html + content[index:]
        return response
