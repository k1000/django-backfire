# -*- coding: utf-8 -*-
from django.conf.urls.defaults import url, patterns

urlpatterns = patterns('',
    url(r'^$', 'backfire.views.get_respond',  
                name='backfire'),
)
