# -*- coding: utf-8 -*-

#from base import FeatureBase
#from urlext import url_extract
#from userext import user_extract
import sys
from base import FeatureBase
from ..feature import url_extract
from ..feature import user_extract
from ..feature import logger
from ..feature import Serialize
import random
import sqlite3

from ..wordseg import wordseg_clean

class FeatureTopic(FeatureBase):
    """docstring for FeatureTopic"""
    def __init__(self, env):
        super(FeatureTopic, self).__init__(env)
        conn = sqlite3.connect('srfe_queue.db')
        c = conn.cursor()
        self.tray = c.execute("SELECT name FROM tag")
        self.schema={}
        for row in self.tray:
            self.schema["topic_"+row[0]] = "numeric"
            #print row[0]
        # Topic dict
        fn_tdict = self.env['dir_kdb'] + "/tdict.pickle"
        self.tdict = Serialize.loads(open(fn_tdict).read())

    def _topic(self, dct, msg):
        score = 0.0
        terms = wordseg_clean(msg.parsed.text)
        for t in terms:
            if t.text in dct:
                score += dct[t.text]
        return score

    def add_features(self, msg):
        conn = sqlite3.connect('srfe_queue.db')
        c = conn.cursor()
        tray2 = c.execute("SELECT name FROM tag")
        for row in tray2:
            msg.feature['topic_'+row[0]] = self._topic(self.tdict[row[0]],msg)
        
logger.debug('Feature module "topic" is plugged!')
