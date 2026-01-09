import React, { useState, useEffect } from 'react';
import { FolderOpen, Upload, Image, Video, File, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoMode, demoData, useDemoAction } from '../hooks/useDemoMode';
import { emit, NAV_EVENTS, ACTION_EVENTS } from '@/utils/telemetry';

export default function Assets() {
  const isDemoMode = useDemoMode();
  const { handleAction } = useDemoAction();
  const [viewMode, setViewMode] = useState('grid');
  const [actionFeedback, setActionFeedback] = useState('');
  const assets = isDemoMode ? demoData.assets : [];
  const assetCount = assets.length;
  const imageCount = isDemoMode ? assets.filter(a => a.type === 'image').length : 0;
  const videoCount = isDemoMode ? assets.filter(a => a.type === 'video').length : 0;

  const categories = [
    { id: 'all', label: 'All Files', icon: FolderOpen, count: assetCount },
    { id: 'images', label: 'Images', icon: Image, count: imageCount },
    { id: 'videos', label: 'Videos', icon: Video, count: videoCount },
    { id: 'documents', label: 'Documents', icon: File, count: 0 }
  ];

  const handleUpload = () => {
    emit(ACTION_EVENTS.ASSET_UPLOAD_ATTEMPTED);
    const feedback = handleAction('upload');
    if (feedback) {
      setActionFeedback(feedback);
      setTimeout(() => setActionFeedback(''), 3000);
    }
  };

  useEffect(() => {
    emit(NAV_EVENTS.ASSETS_OPENED);
  }, []);

  return (
    <div className="container-7xl py-8 px-4">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="h1" style={{ color: 'var(--text-100)' }}>
            Assets
          </h1>
          <p className="lead mt-2">
            Manage your media library
          </p>
        </div>
        <Button className="btn-primary" onClick={handleUpload}>
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>

      {/* Action Feedback */}
      {actionFeedback && (
        <div
          className="card mb-6"
          style={{
            padding: 'var(--s-4)',
            background: 'var(--surf-3)',
            border: '1px solid var(--bd-weak)'
          }}
        >
          <div className="text-sm" style={{ color: 'var(--text-100)' }}>
            {actionFeedback}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="card" style={{ padding: 'var(--s-4)' }}>
            <div className="text-sm font-semibold mb-3 px-2" style={{ color: 'var(--text-80)' }}>
              Categories
            </div>
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    className="w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                    style={{
                      background: 'transparent',
                      color: 'var(--text-80)',
                      fontSize: 'var(--fs-sm)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surf-2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="flex-1 flex items-center justify-between">
                      <span>{category.label}</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          background: 'var(--surf-2)',
                          color: 'var(--text-60)'
                        }}
                      >
                        {category.count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Storage Info */}
          <div className="card mt-4" style={{ padding: 'var(--s-4)' }}>
            <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-80)' }}>
              Storage
            </div>
            <div className="mb-2">
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: 'var(--surf-2)' }}
              >
                <div
                  className="h-full"
                  style={{
                    width: isDemoMode ? '14%' : '0%',
                    background: 'linear-gradient(135deg, var(--acc-a), var(--acc-b))'
                  }}
                />
              </div>
            </div>
            <div className="text-xs" style={{ color: 'var(--text-60)' }}>
              {isDemoMode ? '700 MB of 5 GB used' : '0 MB of 5 GB used'}
            </div>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="lg:col-span-3">
          <div className="card" style={{ padding: 'var(--s-6)' }}>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm" style={{ color: 'var(--text-60)' }}>
                {assetCount} files
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  style={{
                    background: viewMode === 'grid' ? 'var(--surf-3)' : 'transparent'
                  }}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  style={{
                    background: viewMode === 'list' ? 'var(--surf-3)' : 'transparent'
                  }}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {assets.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {assets.map((asset) => {
                  const AssetIcon = asset.type === 'image' ? Image : Video;
                  return (
                    <div
                      key={asset.id}
                      className="card card-hover"
                      style={{
                        padding: 'var(--s-4)',
                        cursor: 'pointer'
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className="w-full aspect-square flex items-center justify-center mb-3 rounded"
                          style={{ background: 'var(--surf-2)' }}
                        >
                          <AssetIcon className="w-8 h-8" style={{ color: 'var(--text-60)' }} />
                        </div>
                        <div className="text-xs font-medium text-center mb-1" style={{ color: 'var(--text-100)' }}>
                          {asset.name}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-60)' }}>
                          {asset.size}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center py-16"
                style={{ minHeight: '400px' }}
              >
                <FolderOpen
                  className="w-16 h-16 mb-4"
                  style={{ color: 'var(--text-60)', opacity: 0.5 }}
                />
                <h3 className="h3 mb-2" style={{ color: 'var(--text-80)' }}>
                  No assets yet
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-60)' }}>
                  Upload images, videos, and files to get started
                </p>
                <Button className="btn-primary" onClick={handleUpload}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Brand Kit Section */}
      <div className="mt-8">
        <h2 className="h3 mb-4" style={{ color: 'var(--text-100)' }}>
          Brand Kit
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card card-quiet" style={{ padding: 'var(--s-6)' }}>
            <Image className="w-6 h-6 mb-3" style={{ color: 'var(--text-60)' }} />
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-100)' }}>
              Logos
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-60)' }}>
              0 files
            </p>
          </div>

          <div className="card card-quiet" style={{ padding: 'var(--s-6)' }}>
            <File className="w-6 h-6 mb-3" style={{ color: 'var(--text-60)' }} />
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-100)' }}>
              Templates
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-60)' }}>
              0 files
            </p>
          </div>

          <div className="card card-quiet" style={{ padding: 'var(--s-6)' }}>
            <Image className="w-6 h-6 mb-3" style={{ color: 'var(--text-60)' }} />
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-100)' }}>
              Brand Colors
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-60)' }}>
              Not configured
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
