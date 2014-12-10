# -*- coding: utf-8 -*-

# This module contains basic features.
# Feature extractors here are supposed to run with minimum configuration.
# After running it well, users can enable more features.

from base import FeatureBase

import re
import random

class FeaturePlatform(FeatureBase):
    """docstring for FeatureTopic"""
    def __init__(self, env):
        super(FeaturePlatform, self).__init__(env)
        self.schema = {
            "platform_renren": "numeric",
            "platform_sina": "numeric",
            "platform_facebook": "numeric",
            "platform_rss": "numeric",
            "platform_sqlite": "numeric",
            "platform_twitter": "numeric",
        }
    
    def add_features(self, msg):
        msg.feature['platform_renren'] = 0
        msg.feature['platform_sina'] = 0
        msg.feature['platform_facebook'] = 0
        msg.feature['platform_rss'] = 0
        msg.feature['platform_sqlite'] = 0
        msg.feature['platform_twitter'] = 0
        plat = msg.platform
        if(plat == "RenrenFeed"):
            msg.feature['platform_renren'] = 1
        if(plat == "SinaWeiboStatus" ):
            msg.feature['platform_sina'] = 1
        if(plat == "FacebookFeed"):
            msg.feature['platform_facebook'] = 1
        if(plat == "RSS"):
            msg.feature['platform_rss'] = 1
        if(plat == "SQLite"):
            msg.feature['platform_sqlite'] = 1
        if(plat == "TwitterStatus"):
            msg.feature['platform_twitter'] = 1
