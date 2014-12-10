# -*- coding: utf-8 -*-

import sys
sys.path.append('../bottle')
sys.path.append('../snsapi')
import snsapi
from snsapi import utils as snsapi_utils
from snsapi import snstype
from snsapi.utils import json
import cPickle as Serialize
from snsapi.snslog import SNSLog as logger

from feature import Feature

class Score(object):
    """docstring for Score"""
    def __init__(self, fn_weight = None):
        super(Score, self).__init__()
        self.feature_weight = None # dict of (feature, weight) pairs
        self.feature_name = None # list of feature name strings
        self.load_weight(fn_weight)

    def load_weight(self, fn = None):
        if fn is None:
            fn = 'conf/weights.json'
        self.feature_weight = json.loads(open(fn, 'r').read())
        self.feature_name = self.feature_weight.keys()
        logger.info("Loaded weights: %s", self.feature_weight)

    def get_score(self, msg):
        Feature.extract(msg)
        score = 0.0
        for (f, w) in self.feature_weight.items():
            if f in msg.feature:
                score += msg.feature[f] * w
        return score

if __name__ == '__main__':
    pass
