SNSRouter
====

Introduction
----

An Internet router connects different IP subnets. 
It may have different interfaces, e.g. 
Ethernet port, Wifi, etc. 
Regardless of how the physical technologies
differs from one another, 
IP exposes unified interface to upper layer protocols. 
The forwarding module of the router does not 
bother to look at lower layer details. 
It just make decision based on IP headers. 

What can be learned is that IP is a good abstraction. 
With this abstraction, you can do more than just forwarding. 
For example, one can build IP firewalls:
filter some packets according to their source address, 
destination address, protocol type, etc. 

Now consider the network of human: **Social Network**. 
It's very easy for one to spread information within one subnet. 
Say, update a status on Twitter, 
post a blog on Facebook, etc. 
What about the information flow across multiple platforms? 
Yes, we need something analogous to Internet router. 
I will term this facility as SNSRouter. 

Long before this project, we already see many manual "routers":

   * You read an interesting news from 163 (web portal) and 
   forward it to one of your QQ groups (IM software). 
   * You find some breaking news on SinaWeibo (micro-blog) and
   forward it to your Renren account (online social network). 

Now we want people to think carefully. 
Is information or the platform more important? 
For me, the answer is absolutely information. 
Just like the case when you access Facebook. 
You do not care whether you are using wired network 
or wireless network. 
You only care your browser can send/receive packtes 
to/from Facebook server successfully. 
IP did this abstraction for you, so things are really easy
(without considering Great Fire Wall). 

We want to enable easier forwarding operation. 
So we need similar abstraction in the Social Network world. 
[SNSAPI](https://github.com/hupili/snsapi/) is 
one of the recent middleware developed by us. 
With this SNSAPI, intelligent cross-platform 
information processing becomes easier. 

SNSRouter uses *SNSAPI* as the backend to interface with 
different social network services. 
It uses *bottle* as the frontend solution. 

You can run SNSRouter as a desktop application. 
Or you can deploy it to a real production HTTP server 
and access it with your browser. 

Deploy
----

1. Clone the repo and all submodules

```
git clone git://github.com/hupili/sns-router.git
cd sns-router
git submodule init
git submodule update
```

2. Copy `conf/*.json.example` to `conf/*.json` and configure accordingly. 

The default configuration should be able to work. 

3. Use one of the following ways to run the frontend:

```
python srfe.py
bash ./run.sh
```

Troubleshooting
----

If you suffer from error messages, please check whether it is due to missing modules. 
Most of the dependencies are standard Python modules. 
Some other 3rd party modules can be installed via pip. 
Also, please read `README.md` under each directory. 
They may provide more information for setup. 

For further problem, please don't hesitate to post an issue. 
Many thanks!
