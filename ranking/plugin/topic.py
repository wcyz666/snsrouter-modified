# -*- coding: utf-8 -*-

#from base import FeatureBase
#from urlext import url_extract
#from userext import user_extract

from base import FeatureBase
from ..feature import url_extract
from ..feature import user_extract
from ..feature import logger
from ..feature import Serialize
import random

from ..wordseg import wordseg_clean

class FeatureTopic(FeatureBase):
    """docstring for FeatureTopic"""
    def __init__(self, env):
        super(FeatureTopic, self).__init__(env)
        self.schema = {
                "topic_tech": "numeric",
                "topic_news": "numeric",
                "topic_sports": "numeric",
                "topic_friends": "numeric",
                "topic_rubbish": "numeric",
                }

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
        msg.feature['topic_tech'] = self._topic(self.tdict['tech'], msg)
        msg.feature['topic_news'] = self._topic(self.tdict['news'], msg)
        msg.feature['topic_sports'] = self._topic(self.tdict['sports'], msg)
        msg.feature['topic_friends'] = self._topic(self.tdict['friends'], msg)
        msg.feature['topic_rubbish'] = self._topic(self.tdict['rubbish'], msg)
        
logger.debug('Feature module "topic" is plugged!')
