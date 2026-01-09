import React, { useState } from 'react';
import { PenTool, Image, Hash, Calendar, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function Composer() {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  const platforms = [
    { id: 'x', name: 'X', color: 'bg-blue-500' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-600' },
    { id: 'meta', name: 'Meta', color: 'bg-blue-700' }
  ];

  return (
    <div className="container-7xl py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="h1" style={{ color: 'var(--text-100)' }}>
            Composer
          </h1>
          <p className="lead mt-2">
            Create and schedule posts across platforms
          </p>
        </div>

        {/* Main Composer Card */}
        <div className="card" style={{ padding: 'var(--s-8)' }}>
          {/* Platform Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-80)' }}>
              Select Platforms
            </label>
            <div className="flex gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => {
                    setSelectedPlatforms(prev =>
                      prev.includes(platform.id)
                        ? prev.filter(p => p !== platform.id)
                        : [...prev, platform.id]
                    );
                  }}
                  className="btn btn-outline"
                  style={{
                    background: selectedPlatforms.includes(platform.id) ? 'var(--surf-3)' : 'var(--surf-1)',
                    borderColor: selectedPlatforms.includes(platform.id) ? 'var(--bd-strong)' : 'var(--bd-weak)'
                  }}
                >
                  {platform.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="mb-6">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full"
              style={{
                background: 'var(--surf-1)',
                borderColor: 'var(--bd-weak)',
                color: 'var(--text-100)',
                fontSize: 'var(--fs-md)',
                padding: 'var(--s-4)',
                borderRadius: 'var(--r-lg)'
              }}
            />
            <div className="text-sm mt-2" style={{ color: 'var(--text-60)' }}>
              {content.length} / 280 characters
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between mb-6 pb-6" style={{ borderBottom: '1px solid var(--bd-weak)' }}>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm">
                <Image className="w-4 h-4 mr-2" />
                Media
              </Button>
              <Button variant="ghost" size="sm">
                <Hash className="w-4 h-4 mr-2" />
                Hashtags
              </Button>
              <Button variant="ghost" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline">
              Save Draft
            </Button>
            <Button className="btn-primary">
              <Send className="w-4 h-4 mr-2" />
              Publish Now
            </Button>
          </div>
        </div>

        {/* Features Preview (Empty State) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card card-quiet" style={{ padding: 'var(--s-6)' }}>
            <Image className="w-6 h-6 mb-3" style={{ color: 'var(--text-60)' }} />
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-100)' }}>
              Media Library
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-60)' }}>
              Upload images and videos
            </p>
          </div>

          <div className="card card-quiet" style={{ padding: 'var(--s-6)' }}>
            <Hash className="w-6 h-6 mb-3" style={{ color: 'var(--text-60)' }} />
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-100)' }}>
              AI Suggestions
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-60)' }}>
              Get hashtag recommendations
            </p>
          </div>

          <div className="card card-quiet" style={{ padding: 'var(--s-6)' }}>
            <PenTool className="w-6 h-6 mb-3" style={{ color: 'var(--text-60)' }} />
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-100)' }}>
              AI Caption
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-60)' }}>
              Generate post variations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
