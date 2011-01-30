About
-----

"Backfire allows you to save CSS changes made with Firebug, Webkit Developer Toolbar or any other client side debugging tool."
Django-backfire is integration of backfire helper for Django framework.

Original backfire code was developed by guys from http://quplo.com/ and you can find it in http://code.google.com/p/backfire/ Thanks for they efforts.

More info how it works You can find in http://code.google.com/p/backfire/w/list

Installation
------------
    
1. Download and install::

        git clone https://github.com/k1000/django-backfire.git
        cd backfire
        python setup.py install

    or using pip::     
    
        pip install -e git+https://github.com/k1000/django-backfire.git#egg=backfire

2. Copy or link media/backfire folder to your media folder

Settings
--------
1. Add backfire middleware at the end of MIDDLEWARE_CLASSES in settings.py file::

    "backfire.middleware.BackfireMiddleware",
 
2. add to your urls.py::
    
    (r'^backfire/$', 'backfire.views.get_respond'),

Usage
-----

You must be logged as staff member to be able to save changes.

LICENSE
-------

Django-backfire is released under the MIT License. See the _LICENSE file for more
details.

.. _LICENSE: http://github.com/k1000/django-backfire/blob/master/LICENSE
