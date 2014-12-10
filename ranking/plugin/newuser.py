# -*- coding: utf-8 -*-

# This module contains basic features. 
# Feature extractors here are supposed to run with minimum configuration. 
# After running it well, users can enable more features. 

from base import FeatureBase
from ..feature import url_extract
from ..feature import user_extract
from ..feature import logger
from ..feature import Serialize
import sqlite3

class FeatureUser(FeatureBase):
    """docstring for FeatureTopic"""
    def __init__(self, env):
        super(FeatureUser, self).__init__(env)
        conn = sqlite3.connect('srfe_queue.db')
        c = conn.cursor()
        self.tray = c.execute("SELECT name FROM tag")
        self.schema={}
        for row in self.tray:
            self.schema["user_"+row[0]] = "numeric"
            #print row[0]
        # Topic dict
        #self.tdict = Serialize.loads(open(fn_tdict).read())

        #self.schema = {
         #       "user_tech": "numeric",
          #      "user_news": "numeric",
           #     "user_sports": "numeric",
            #    "user_friends": "numeric",
             #   "user_rubbish": "numeric",
              #  }

        # User dict
        fn_udict = self.env['dir_kdb'] + "/udict.pickle"
        self.udict = Serialize.loads(open(fn_udict).read())

    def _user(self, dct, msg):
        if msg.parsed.username in dct:
            return dct[msg.parsed.username]
        else:
            return 0

    def add_features(self, msg):
        conn = sqlite3.connect('srfe_queue.db')
        c = conn.cursor()
        tray2 = c.execute("SELECT name FROM tag")
        for row in tray2:
            msg.feature['user_'+row[0]] = self._user(self.udict[row[0]],msg)
        #msg.feature['user_tech'] = self._user(self.udict['tech'], msg)
        #msg.feature['user_news'] = self._user(self.udict['news'], msg)
        #msg.feature['user_sports'] = self._user(self.udict['sports'], msg)
        #msg.feature['user_friends'] = self._user(self.udict['friends'], msg)
        #msg.feature['user_rubbish'] = self._user(self.udict['rubbish'], msg)

logger.debug('Feature module "user" is plugged!')
