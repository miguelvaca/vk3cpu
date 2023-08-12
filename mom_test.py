# Program to develop and test algorithms for MoM antenna calculator
import numpy as np

#	var t_seg = {};
#   t_seg.start = wire.points[m-1];
#   t_seg.end = wire.points[m+1];
#   t_seg.mid = wire.points[m];
#   t_seg.len = wire.seg_len;
#   t_seg.radius = wire.radius;
#   t_seg.feedpoint = false;
#   segments.push(t_seg);

t_seg = {}
t_seg['start'] = [0.11, 0.0, 0.0]
t_seg['end'] = [0.15, 0.0, 0.0]
t_seg['mid'] = [0.13, 0.0, 0.0]
t_seg['len'] = 0.040
t_seg['radius'] = 0.002

tp1 = [0.0, 100.0, 100.0]
