import os
import sys

dir_name = 'lib'
root_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(root_dir, dir_name))
