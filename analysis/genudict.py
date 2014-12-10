# -*- coding: utf-8 -*-
# Generate userc dict based on:
#    {User Frequency} * {Inverse Whole Frequency}

import cPickle as Serialize
import re

def load_dict(path):
    '''
    Format of dict:
    \d+ \w
    {freq} {term}

    '''
    d = {}
    with open(path, 'r') as fp:
        for line in fp:
            r = re.compile(r'^\s*(\d+) (.+)$')
            m = r.match(line)
            if m:
                freq = float(m.groups()[0])
                term = m.groups()[1]
                #print freq
                #print term

                # Decode to unicode:
                #     'username' in snsapi.snstype.Message.parsed is unicode
                d[term.decode('utf-8')] = freq
    return d

def weight(dict_all, dict_topic):
    '''
    {Topic Frequency} * {Inverse Whole Frequency}
    '''
    w_total = 0.0
    for term in dict_topic:
        try:
            dict_topic[term] /= dict_all[term]
            w_total += dict_topic[term]
        except KeyError, e:
            pass
            #print e.message
    for term in dict_topic:
        dict_topic[term] /= w_total

if __name__ == '__main__':
    d_all = load_dict('kdb/user.all')
    d_tech = load_dict('kdb/user.mark.tech')
    d_news = load_dict('kdb/user.mark.news')
    d_sports = load_dict('kdb/user.mark.sports')
    d_friends = load_dict('kdb/user.mark.friends')
    d_rubbish = load_dict('kdb/user.mark.rubbish')
    
    weight(d_all, d_tech)
    weight(d_all, d_news)
    weight(d_all, d_sports)
    weight(d_all, d_friends)
    weight(d_all, d_rubbish)

    tdict = {
            'tech': d_tech,
            'news': d_news,
            'sports': d_sports,
            'friends': d_friends,
            'rubbish': d_rubbish,
            }

    with open('kdb/udict.pickle', 'w') as fp:
        fp.write(Serialize.dumps(tdict))

