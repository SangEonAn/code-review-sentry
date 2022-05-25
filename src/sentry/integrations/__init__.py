"""
The Integrations Module contains the infrastructure to send API calls to and
receive webhook requests from third-party services. It contains the business
logic to implement several of Sentry's features including Ticket Rules,
Notifications, and Stacktrace Linking. No models are defined in this module.

You should expect each provider to have its own module with the following files:
    - actions/          Alert Rule Action definitions.
    - client.py         Custom APIClient for the provider.
    - integration.py    All of the business logic. Implements the IntegrationInstallation interface.
    - urls.py           Map externally facing URLs to the webhooks defined below.
    - webhooks/         Endpoints that the providers can hook into to perform actions.

For more Integrations code, see also:
    - src/sentry/models/integrations/
    - src/sentry/notifications/
    - src/sentry/shared_integrations/
    - src/sentry_plugins/
"""

__all__ = (
    "FeatureDescription",
    "IntegrationFeatures",
    "IntegrationInstallation",
    "IntegrationMetadata",
    "IntegrationProvider",
)

from .analytics import register_analytics
from .base import (
    FeatureDescription,
    IntegrationFeatures,
    IntegrationInstallation,
    IntegrationMetadata,
    IntegrationProvider,
)
from .manager import IntegrationManager

register_analytics()
default_manager = IntegrationManager()
all = default_manager.all
get = default_manager.get
exists = default_manager.exists
register = default_manager.register
unregister = default_manager.unregister
