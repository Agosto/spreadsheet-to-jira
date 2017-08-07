# -*- coding: utf-8 -*-
"""The root of JIRA package namespace."""
from __future__ import unicode_literals
from pbr.version import VersionInfo

# _v = VersionInfo('jira').semantic_version()
# __version__ = _v.release_string()
# version_info = _v.version_tuple()

from forked_jira.client import Comment  # noqa: E402
from forked_jira.client import Issue  # noqa: E402
from forked_jira.client import JIRA  # noqa: E402
from forked_jira.client import Priority  # noqa: E402
from forked_jira.client import Project  # noqa: E402
from forked_jira.client import Role  # noqa: E402
from forked_jira.client import User  # noqa: E402
from forked_jira.client import Watchers  # noqa: E402
from forked_jira.client import Worklog  # noqa: E402
from forked_jira.config import get_jira  # noqa: E402
from forked_jira.exceptions import JIRAError  # noqa: E402

__all__ = (
    'Comment',
    '__version__',
    'Issue',
    'JIRA',
    'JIRAError',
    'Priority',
    'Project',
    'Role',
    'User',
    'Watchers',
    'Worklog',
    'get_jira'
)
