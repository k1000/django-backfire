from django.conf import settings
class BackfireMiddleware(object):
    html = """
    <script src="%sjs/backfire/backfire-1.0.js"></script>
	<script src="%sjs/backfire/example.js"></script>
	""" % ( settings.MEDIA_URL, settings.MEDIA_URL )
	
    def process_response(self, request, response):
        if request.user.is_staff:
            content = response.content
            index = content.find('</body>')
            if index == -1: return response
            response.content = content[:index] + self.html + content[index:]
            print content[index:]
        return response