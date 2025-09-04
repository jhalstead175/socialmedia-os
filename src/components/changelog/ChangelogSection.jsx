import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { ChangelogEntry } from "@/api/entities";
import { format, parseISO } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import {
  PlusCircle,
  ArrowUpCircle,
  Wrench,
  Server,
  Search
} from 'lucide-react';
import { Input } from "@/components/ui/input";

const tagConfig = {
  feature: { icon: PlusCircle, color: 'bg-blue-100 text-blue-800' },
  improvement: { icon: ArrowUpCircle, color: 'bg-green-100 text-green-800' },
  fix: { icon: Wrench, color: 'bg-orange-100 text-orange-800' },
  infra: { icon: Server, color: 'bg-purple-100 text-purple-800' },
};

export default function ChangelogSection() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadChangelog = async () => {
      try {
        const data = await ChangelogEntry.list('-date', 50);
        setEntries(data);
      } catch (err) {
        setError("Could not load changelog entries.");
        console.error(err);
      }
      setIsLoading(false);
    };
    loadChangelog();
  }, []);

  const filteredEntries = entries.filter(entry => {
    const tagMatch = selectedTag === 'all' || entry.tag === selectedTag;
    const searchMatch = searchQuery === '' ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.body.toLowerCase().includes(searchQuery.toLowerCase());
    return tagMatch && searchMatch;
  });

  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    // Handle cases where entry.date might be null or invalid
    if (!entry.date) return acc;
    try {
      const month = format(parseISO(entry.date), 'MMMM yyyy');
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(entry);
    } catch (e) {
      console.error(`Invalid date format for entry ${entry.id}:`, entry.date);
    }
    return acc;
  }, {});

  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-white rounded-xl shadow-sm border">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-600 mr-2 shrink-0">Filter by:</span>
          <button onClick={() => setSelectedTag('all')} className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedTag === 'all' ? 'bg-navy text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>All</button>
          {Object.keys(tagConfig).map(tag => (
            <button key={tag} onClick={() => setSelectedTag(tag)} className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedTag === tag ? 'bg-navy text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search changelog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-500">Loading...</div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : Object.keys(groupedEntries).length === 0 ? (
        <div className="text-center py-16 text-slate-500">No matching entries found.</div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedEntries).map(([month, monthEntries]) => (
            <div key={month}>
              <h2 className="text-xl font-semibold text-slate-700 mb-6 pb-2 border-b-2 border-slate-200">{month}</h2>
              <div className="space-y-8">
                {monthEntries.map(entry => (
                  <div key={entry.id} className="grid md:grid-cols-4 gap-4 p-6 bg-white rounded-xl shadow-sm border">
                    <div className="md:col-span-1">
                      <p className="text-sm text-slate-500 mb-1">{format(parseISO(entry.date), 'MMMM d, yyyy')}</p>
                      <Badge className={`${tagConfig[entry.tag]?.color || 'bg-gray-100 text-gray-800'} capitalize`}>{entry.tag}</Badge>
                    </div>
                    <div className="md:col-span-3">
                      <h3 className="font-semibold text-navy text-lg mb-2">{entry.title}</h3>
                      <div className="prose prose-sm max-w-none text-slate-600">
                        <ReactMarkdown>{entry.body}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}