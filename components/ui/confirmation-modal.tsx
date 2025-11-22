'use client'

import React from 'react'
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from './modal'
import { Button } from './button'

export type ConfirmationType = 'danger' | 'warning' | 'info' | 'success'

interface ConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  type?: ConfirmationType
  onConfirm: () => void | Promise<void>
  loading?: boolean
  requiresTyping?: string // Require user to type this text to confirm
  details?: string
  consequences?: string[]
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'info',
  onConfirm,
  loading = false,
  requiresTyping,
  details,
  consequences,
}: ConfirmationModalProps) {
  const [typedText, setTypedText] = React.useState('')
  const [isConfirmEnabled, setIsConfirmEnabled] = React.useState(!requiresTyping)
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <XCircle className="h-6 w-6 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'info':
      default:
        return <Info className="h-6 w-6 text-blue-500" />
    }
  }

  const getConfirmVariant = () => {
    switch (type) {
      case 'danger':
        return 'destructive' as const
      case 'warning':
        return 'outline' as const
      case 'success':
        return 'default' as const
      case 'info':
      default:
        return 'default' as const
    }
  }

  React.useEffect(() => {
    if (requiresTyping) {
      setIsConfirmEnabled(typedText === requiresTyping)
    }
  }, [typedText, requiresTyping])

  React.useEffect(() => {
    if (!open) {
      setTypedText('')
      setIsConfirmEnabled(!requiresTyping)
    }
  }, [open, requiresTyping])

  const handleConfirm = async () => {
    if (!isConfirmEnabled) return
    
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('Confirmation action failed:', error)
      // Don't close modal on error - let the parent handle it
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-lg border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-white to-blue-50/30 dark:from-background dark:to-blue-950/20">
        <ModalHeader className="pb-6 bg-gradient-to-r from-blue-500/5 to-blue-600/5 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 shadow-lg">
              {getIcon()}
            </div>
            <div className="space-y-3">
              <ModalTitle className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 bg-clip-text text-transparent">
                {title}
              </ModalTitle>
              <ModalDescription className="text-base leading-relaxed text-blue-700 dark:text-blue-300 font-medium">
                {description}
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>
        
        {(details || consequences || requiresTyping) && (
          <div className="px-6 space-y-6">
            {details && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm leading-relaxed">{details}</p>
              </div>
            )}
            
            {consequences && consequences.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <p className="text-sm font-semibold text-destructive">
                    This action will:
                  </p>
                </div>
                <ul className="space-y-2 ml-6">
                  {consequences.map((consequence, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <span className="text-destructive mt-0.5 font-bold">•</span>
                      <span className="text-muted-foreground">{consequence}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {requiresTyping && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Type <code className="px-2 py-1 bg-muted rounded-md text-xs font-mono border">
                      {requiresTyping}
                    </code> to confirm:
                  </p>
                  <input
                    type="text"
                    value={typedText}
                    onChange={(e) => setTypedText(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder={requiresTyping}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        <ModalFooter className="pt-6 bg-gradient-to-r from-blue-500/5 to-blue-600/5 border-t border-blue-200 dark:border-blue-800">
          <Button
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 h-11 font-semibold bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-md hover:shadow-lg transition-all duration-300 border-0"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !isConfirmEnabled}
            className={`flex-1 h-11 font-semibold shadow-md hover:shadow-lg transition-all duration-300 border-0 ${
              type === 'danger' 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                : type === 'warning'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            } text-white`}
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Processing...
                </span>
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// Hook for easier confirmation modal usage
export function useConfirmationModal() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<{
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    type?: ConfirmationType
    onConfirm: () => void | Promise<void>
    requiresTyping?: string
    details?: string
    consequences?: string[]
  } | null>(null)

  const confirm = React.useCallback((options: {
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    type?: ConfirmationType
    onConfirm: () => void | Promise<void>
    requiresTyping?: string
    details?: string
    consequences?: string[]
  }) => {
    setConfig(options)
    setIsOpen(true)
  }, [])

  const ConfirmationModalComponent = React.useCallback(() => {
    if (!config) return null

    return (
      <ConfirmationModal
        open={isOpen}
        onOpenChange={setIsOpen}
        title={config.title}
        description={config.description}
        confirmLabel={config.confirmLabel}
        cancelLabel={config.cancelLabel}
        type={config.type}
        onConfirm={config.onConfirm}
        requiresTyping={config.requiresTyping}
        details={config.details}
        consequences={config.consequences}
      />
    )
  }, [isOpen, config])

  return {
    confirm,
    ConfirmationModal: ConfirmationModalComponent,
  }
}

// Specialized confirmation hooks
export function useDeleteConfirmation() {
  const { confirm, ConfirmationModal } = useConfirmationModal()
  
  const confirmDelete = React.useCallback((
    itemName: string,
    onConfirm: () => void | Promise<void>,
    consequences?: string[]
  ) => {
    confirm({
      title: `Delete ${itemName}?`,
      description: `This action cannot be undone. Are you sure you want to delete this ${itemName.toLowerCase()}?`,
      confirmLabel: 'Delete',
      type: 'danger',
      onConfirm,
      consequences: consequences || [`Permanently remove this ${itemName.toLowerCase()}`, 'This action cannot be undone'],
    })
  }, [confirm])
  
  return { confirmDelete, ConfirmationModal }
}

export function useDangerousActionConfirmation() {
  const { confirm, ConfirmationModal } = useConfirmationModal()
  
  const confirmDangerousAction = React.useCallback((
    actionName: string,
    onConfirm: () => void | Promise<void>,
    requiresTyping?: string,
    consequences?: string[]
  ) => {
    confirm({
      title: `Confirm ${actionName}`,
      description: `This is a potentially destructive action. Please confirm you want to proceed.`,
      confirmLabel: actionName,
      type: 'danger',
      onConfirm,
      requiresTyping,
      consequences,
    })
  }, [confirm])
  
  return { confirmDangerousAction, ConfirmationModal }
}