from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet
from . import pyq_views

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')

urlpatterns = [
    path('', include(router.urls)),
    # Smart Paper Routes
    path('pyq/upload-batch/', pyq_views.upload_batch, name='pyq-upload-batch'),
    path('pyq/demo/', pyq_views.process_demo, name='pyq-demo'),
    path('pyq/coverage/', pyq_views.coverage, name='pyq-coverage'),
    path('pyq/generate/', pyq_views.generate, name='pyq-generate'),
]