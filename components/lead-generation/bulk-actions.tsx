'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { useToast } from '../ui/toast'
import { 
  CheckSquare,
  Square,
  Tag,
  Download,
  Trash2,
  Star,
  CheckCircle,
  X,
  Users,
  Filter,
  ArrowRight,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Lead, LeadTag, BulkAction, BulkActionType } from '../../lib/types'

interface BulkActionsProps {
  leads: Lead[]
  selectedLeads: string[]
  onSelectionChange: (leadIds: string[]) => void
  organizationId: string
  className?: string
  onActionComplete?: () => void
}

interface BulkActionModalProps {
  isOpen: boolean
  onClose: () => void
  actionType: BulkActionType
  selectedCount: number
  onConfirm: (actionData?: any) => Promise<void>
  availableTags?: LeadTag[]
}

function BulkActionModal({ 
  isOpen, 
  onClose, 
  actionType, 
  selectedCount, 
  onConfirm,
  availableTags = []
}: BulkActionModalProps) {
  const [actionData, setActionData] = useState<any>({})
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm(actionData)
      onClose()
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  const getActionTitle = () => {
    switch (actionType) {
      case 'tag': return 'Add Tags'
      case 'export': return 'Export Leads'
      case 'delete': return 'Delete Leads'
      case 'update_score': return 'Update Lead Scores'
      case 'verify': return 'Verify Leads'
      default: return 'Bulk Action'
    }
  }

  const getActionDescription = () => {
    switch (actionType) {
      case 'tag': return `Add tags to ${selectedCount} selected leads`
      case 'export': return `Export ${selectedCount} selected leads`
      case 'delete': return `Permanently delete ${selectedCount} selected leads`
      case 'update_score': return `Recalculate scores for ${selectedCount} selected leads`
      case 'verify': return `Verify contact information for ${selectedCount} selected leads`
      default: return `Perform action on ${selectedCount} selected leads`
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              {actionType === 'tag' && <Tag className="h-5 w-5" />}
              {actionType === 'export' && <Download className="h-5 w-5" />}
              {actionType === 'delete' && <Trash2 className="h-5 w-5 text-destructive" />}
              {actionType === 'update_score' && <Star className="h-5 w-5" />}
              {actionType === 'verify' && <CheckCircle className="h-5 w-5" />}
              <span>{getActionTitle()}</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>{getActionDescription()}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Tag Selection */}
          {actionType === 'tag' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Tags</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableTags.map(tag => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`tag-${tag.id}`}
                      checked={actionData.tagIds?.includes(tag.id) || false}
                      onChange={(e) => {
                        const tagIds = actionData.tagIds || []
                        if (e.target.checked) {
                          setActionData({ ...actionData, tagIds: [...tagIds, tag.id] })
                        } else {
                          setActionData({ ...actionData, tagIds: tagIds.filter((id: string) => id !== tag.id) })
                        }
                      }}
                      className="rounded"
                    />
                    <label htmlFor={`tag-${tag.id}`} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: tag.color || '#3B82F6' }}
                      />
                      <span className="text-sm">{tag.name}</span>
                    </label>
                  </div>
                ))}
              </div>
              {availableTags.length === 0 && (
                <p className="text-sm text-muted-foreground">No tags available. Create tags first.</p>
              )}
            </div>
          )}

          {/* Export Format Selection */}
          {actionType === 'export' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <div className="space-y-2">
                {[
                  { value: 'csv', label: 'CSV (Comma Separated Values)' },
                  { value: 'excel', label: 'Excel Spreadsheet' },
                  { value: 'json', label: 'JSON (JavaScript Object Notation)' }
                ].map(format => (
                  <div key={format.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`format-${format.value}`}
                      name="exportFormat"
                      value={format.value}
                      checked={actionData.format === format.value}
                      onChange={(e) => setActionData({ ...actionData, format: e.target.value })}
                      className="rounded"
                    />
                    <label htmlFor={`format-${format.value}`} className="text-sm">
                      {format.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          {actionType === 'delete' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">
                  This action cannot be undone. The selected leads will be permanently deleted.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="confirmDelete"
                  checked={actionData.confirmed || false}
                  onChange={(e) => setActionData({ ...actionData, confirmed: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="confirmDelete" className="text-sm">
                  I understand this action cannot be undone
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={isProcessing || (actionType === 'delete' && !actionData.confirmed)}
              className={cn(
                actionType === 'delete' && 'bg-destructive hover:bg-destructive/90'
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'tag' && <Tag className="h-4 w-4 mr-2" />}
                  {actionType === 'export' && <Download className="h-4 w-4 mr-2" />}
                  {actionType === 'delete' && <Trash2 className="h-4 w-4 mr-2" />}
                  {actionType === 'update_score' && <Star className="h-4 w-4 mr-2" />}
                  {actionType === 'verify' && <CheckCircle className="h-4 w-4 mr-2" />}
                  Confirm
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function BulkActions({ 
  leads, 
  selectedLeads, 
  onSelectionChange, 
  organizationId,
  className,
  onActionComplete
}: BulkActionsProps) {
  const { addToast } = useToast()
  
  // State
  const [availableTags, setAvailableTags] = useState<LeadTag[]>([])
  const [bulkActions, setBulkActions] = useState<BulkAction[]>([])
  const [showModal, setShowModal] = useState(false)
  const [currentAction, setCurrentAction] = useState<BulkActionType>('tag')
  const [loading, setLoading] = useState(false)

  // Load available tags
  const loadTags = async () => {
    try {
      const response = await fetch(`/api/leads/tags?organizationId=${organizationId}`)
      const data = await response.json()

      if (response.ok) {
        setAvailableTags(data.tags || [])
      }
    } catch (error) {
      console.error('Failed to load tags:', error)
    }
  }

  // Load bulk actions history
  const loadBulkActions = async () => {
    try {
      const response = await fetch(`/api/leads/bulk-actions?organizationId=${organizationId}`)
      const data = await response.json()

      if (response.ok) {
        setBulkActions(data.actions || [])
      }
    } catch (error) {
      console.error('Failed to load bulk actions:', error)
    }
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(leads.map(lead => lead.id))
    }
  }

  // Handle individual selection
  const handleSelectLead = (leadId: string) => {
    if (selectedLeads.includes(leadId)) {
      onSelectionChange(selectedLeads.filter(id => id !== leadId))
    } else {
      onSelectionChange([...selectedLeads, leadId])
    }
  }

  // Start bulk action
  const startBulkAction = (actionType: BulkActionType) => {
    if (selectedLeads.length === 0) {
      addToast({
        type: 'error',
        title: 'No Selection',
        message: 'Please select leads before performing bulk actions'
      })
      return
    }

    setCurrentAction(actionType)
    setShowModal(true)
  }

  // Execute bulk action
  const executeBulkAction = async (actionData?: any) => {
    try {
      setLoading(true)

      const response = await fetch('/api/leads/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          actionType: currentAction,
          targetLeads: selectedLeads,
          actionData
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute bulk action')
      }

      addToast({
        type: 'success',
        title: 'Action Completed',
        message: `Successfully performed ${currentAction} on ${selectedLeads.length} leads`
      })

      // Clear selection
      onSelectionChange([])

      // Refresh data
      if (onActionComplete) {
        onActionComplete()
      }

      // Reload bulk actions history
      await loadBulkActions()

    } catch (error) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: error instanceof Error ? error.message : 'Failed to execute bulk action'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Load data on mount
  useEffect(() => {
    if (organizationId) {
      loadTags()
      loadBulkActions()
    }
  }, [organizationId])

  const selectedCount = selectedLeads.length
  const allSelected = selectedCount === leads.length && leads.length > 0
  const someSelected = selectedCount > 0 && selectedCount < leads.length

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selection Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center space-x-2"
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4" />
                ) : someSelected ? (
                  <div className="h-4 w-4 border-2 border-primary bg-primary/20 rounded-sm flex items-center justify-center">
                    <div className="h-2 w-2 bg-primary rounded-sm" />
                  </div>
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span>
                  {allSelected ? 'Deselect All' : 'Select All'}
                </span>
              </Button>

              {selectedCount > 0 && (
                <Badge variant="secondary">
                  {selectedCount} selected
                </Badge>
              )}
            </div>

            {selectedCount > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startBulkAction('tag')}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Tag
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startBulkAction('export')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startBulkAction('update_score')}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Update Scores
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startBulkAction('verify')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startBulkAction('delete')}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Individual Lead Selection */}
      <div className="space-y-2">
        {leads.map(lead => (
          <Card 
            key={lead.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedLeads.includes(lead.id) && "ring-2 ring-primary bg-primary/5"
            )}
            onClick={() => handleSelectLead(lead.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {selectedLeads.includes(lead.id) ? (
                    <CheckSquare className="h-5 w-5 text-primary" />
                  ) : (
                    <Square className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">{lead.business_name}</h4>
                    <div className="flex items-center space-x-2">
                      {lead.lead_score && (
                        <Badge variant="outline" className="text-xs">
                          Score: {lead.lead_score}
                        </Badge>
                      )}
                      {lead.verification_status === 'verified' && (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                    {lead.email && (
                      <span className="truncate">{lead.email}</span>
                    )}
                    {lead.phone && (
                      <span>{lead.phone}</span>
                    )}
                    {lead.industry && (
                      <Badge variant="secondary" className="text-xs">
                        {lead.industry}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bulk Actions */}
      {bulkActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Bulk Actions</CardTitle>
            <CardDescription>History of bulk operations performed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bulkActions.slice(0, 5).map(action => (
                <div key={action.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center space-x-2">
                    {action.action_type === 'tag' && <Tag className="h-4 w-4" />}
                    {action.action_type === 'export' && <Download className="h-4 w-4" />}
                    {action.action_type === 'delete' && <Trash2 className="h-4 w-4" />}
                    {action.action_type === 'update_score' && <Star className="h-4 w-4" />}
                    {action.action_type === 'verify' && <CheckCircle className="h-4 w-4" />}
                    <span className="text-sm font-medium capitalize">
                      {action.action_type.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {action.target_leads.length} leads
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={action.status === 'completed' ? 'default' : 
                               action.status === 'failed' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {action.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(action.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Action Modal */}
      <BulkActionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        actionType={currentAction}
        selectedCount={selectedCount}
        onConfirm={executeBulkAction}
        availableTags={availableTags}
      />
    </div>
  )
}