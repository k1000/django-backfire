from django.conf import settings
from django.middleware.csrf import get_token

class BackfireMiddleware(object):
    html = """
    <input type=hidden name=csrfmiddlewaretoken value=\"" + csrf +'">'
    <script src="%sjs/backfire/js/backfire-1.0.js"></script>
	<script src="%sjs/backfire/js/example.js"></script>
	""" % ( get_token(request), settings.MEDIA_URL, settings.MEDIA_URL )
	
    def process_response(self, request, response):
        if request.user.is_staff:
            content = response.content
            index = content.find('</body>')
            if index == -1: return response
            response.content = content[:index] + self.html + content[index:]
            print content[index:]
        return response