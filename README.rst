http://code.google.com/p/backfire/

Add in the base.html template:

{% if user.is_staff %}
	{% csrf_token %}
	<script src="{{ MEDIA_URL }}js/backfire/backfire-1.0.js"></script>
	<script src="{{ MEDIA_URL }}js/backfire/example.js"></script>
  {% endif %}