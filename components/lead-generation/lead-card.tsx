'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Star, 
  StarOff,
  Copy,
  ExternalLink,
  MessageSquare,
  Check,
  MapPin
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Lead } from '../../lib/types'

interface LeadCardProps {
  lead: Lead
  onFavorite?: (leadId: string, isFavorited: boolean) => void
  onAddNote?: (leadId: string, note: string) => void
  className?: string
  isFavorited?: boolean
  note?: string
}

export function LeadCard({ 
  lead, 
  onFavorite, 
  onAddNote, 
  className,
  isFavorited = false,
  note = ''
}: LeadCardProps) {
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [noteText, setNoteText] = useState(note)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Copy to clipboard functionality
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (onFavorite) {
      onFavorite(lead.id, !isFavorited)
    }
  }

  // Handle note save
  const handleNoteSave = () => {
    if (onAddNote) {
      onAddNote(lead.id, noteText)
    }
    setShowNoteInput(false)
  }

  // Get confidence score color
  const getConfidenceColor = (score: number | null) => {
    if (!score) return 'secondary'
    if (score >= 0.8) return 'default'
    if (score >= 0.6) return 'secondary'
    return 'outline'
  }

  // Format confidence score
  const formatConfidence = (score: number | null) => {
    if (!score) return 'N/A'
    return `${Math.round(score * 100)}%`
  }

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">
              {lead.business_name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={getConfidenceColor(lead.confidence_score)} className="text-xs">
                {formatConfidence(lead.confidence_score)} confidence
              </Badge>
              {isFavorited && (
                <Badge variant="outline" className="text-xs">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Favorited
                </Badge>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteToggle}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isFavorited ? (
              <Star className="h-4 w-4 fill-current text-yellow-500" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Rating and Address */}
        {(lead.rating || lead.address) && (
          <div className="space-y-2 pb-2 border-b border-border/50">
            {lead.rating && (
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current shrink-0" />
                <span className="text-sm font-medium">{lead.rating}</span>
                {lead.review_count && (
                  <span className="text-xs text-muted-foreground">
                    ({lead.review_count} reviews)
                  </span>
                )}
              </div>
            )}
            {lead.address && (
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground line-clamp-2" title={lead.address}>
                  {lead.address}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-2">
          {lead.email && (
            <div className="flex items-center justify-between group/item">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{lead.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(lead.email!, 'email')}
                className="opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 ml-2"
              >
                {copiedField === 'email' ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}

          {lead.phone && (
            <div className="flex items-center justify-between group/item">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{lead.phone}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(lead.phone!, 'phone')}
                className="opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 ml-2"
              >
                {copiedField === 'phone' ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}

          {lead.website && (
            <div className="flex items-center justify-between group/item">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                <a 
                  href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate"
                >
                  {lead.website}
                </a>
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(lead.website!, 'website')}
                >
                  {copiedField === 'website' ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <a 
                    href={lead.website!.startsWith('http') ? lead.website! : `https://${lead.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="pt-2 border-t border-border/50">
          {note && !showNoteInput ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Note</span>
              </div>
              <p className="text-sm text-foreground bg-muted/50 p-2 rounded text-wrap wrap-break-word">
                {note}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNoteInput(true)}
                className="text-xs"
              >
                Edit Note
              </Button>
            </div>
          ) : showNoteInput ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Add Note</span>
              </div>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note about this lead..."
                className="w-full text-sm p-2 border border-border rounded resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                rows={2}
              />
              <div className="flex items-center space-x-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleNoteSave}
                  className="text-xs"
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowNoteInput(false)
                    setNoteText(note)
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNoteInput(true)}
              className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Add Note
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}