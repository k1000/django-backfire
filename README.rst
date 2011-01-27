About
-----

Django-backfire is integration of backfire helper for django framework.
"In support of the "Design in the browser" philosophy Backfire allows you to save CSS changes made with Firebug, Webkit Developer Toolbar or any other clientside debugging tool."

Original backfire code was developed by guys from http://quplo.com/ and you can find it in http://code.google.com/p/backfire/ Thanks for they efforts.

More info how it works You can find in http://code.google.com/p/backfire/w/list

Installation
------------

Place backfire somewhere on your python path

Copy or link media/backfire folder to your media folder

Settings
--------
	
	Add backfire middleware "backfire.middleware.BackfireMiddleware" at the end of MIDDLEWARE_CLASSES or add code below at the end of the base.html template::
	
		{% if user.is_staff %}
			{% csrf_token %}
			<script src="{{ MEDIA_URL }}js/backfire/js/backfire-1.0.js"></script>
			<script src="{{ MEDIA_URL }}js/backfire/js/example.js"></script>
		{% endif %}
	
	add to your urls::
	
		url(r'^backfire/', include('backfire.urls')),


LICENSE
-------

Django-backfire is released under the MIT License. See the LICENSE_ file for more
details.

.. _LICENSE: http://github.com/k1000/django-backfire/blob/master/LICENSE
