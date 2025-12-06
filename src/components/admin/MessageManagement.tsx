import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Search, Eye, Trash2, MoreVertical, MessageSquare, User, Clock, Mail, Plus, Loader2, Send } from 'lucide-react';
import { Message, User as UserType } from '../../services/firestore.service';
import { ApiService } from '../../services/api.service';
import { toast } from 'sonner';
import { formatDate } from '../../utils/firebase-helpers';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { Skeleton } from '../ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';

interface MessageManagementProps {
  users: UserType[];
}

export function MessageManagement({ users }: MessageManagementProps) {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [receiverSearch, setReceiverSearch] = useState('');
  const [selectedReceiver, setSelectedReceiver] = useState<string>('');
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (users.length > 0) {
      loadMessages();
    }
  }, [users]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      // Get all messages in a single call
      const allMessages = await ApiService.getAllMessages();
      
      // Filter out any invalid messages (e.g., those with only id)
      const validMessages = allMessages.filter((msg: any) => 
        msg && msg.sender_id && msg.receiver_id && msg.content
      );
      
      setMessages(validMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
      setMessages([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredMessages = messages.filter(message => {
    const sender = users.find(u => u.id === message.sender_id);
    const receiver = users.find(u => u.id === message.receiver_id);
    
    const matchesSearch = (message.content || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                         (sender?.name || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                         (receiver?.name || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'read' && message.read) ||
                         (statusFilter === 'unread' && !message.read);
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const {
    paginatedItems: paginatedMessages,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage: setPagItemsPerPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination(filteredMessages, { itemsPerPage });

  // Reset to page 1 when filters change
  useEffect(() => {
    goToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, statusFilter]);

  const getSenderName = (senderId: string) => {
    const sender = users.find(u => u.id === senderId);
    return sender?.name || 'Unknown Sender';
  };

  const getReceiverName = (receiverId: string) => {
    const receiver = users.find(u => u.id === receiverId);
    return receiver?.name || 'Unknown Receiver';
  };

  const handleViewDetails = (message: Message) => {
    setSelectedMessage(message);
    setShowDetailsDialog(true);
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    // Guardar datos del mensaje para undo
    const messageToDelete = { ...selectedMessage };

    try {
      await ApiService.deleteMessage(selectedMessage.id);
      
      // Toast con opción de undo
      toast.success('Message deleted successfully', {
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              // Recrear mensaje
              await ApiService.createMessage({
                sender_id: messageToDelete.sender_id,
                receiver_id: messageToDelete.receiver_id,
                content: messageToDelete.content,
                subject: messageToDelete.subject || '',
              });
              toast.success('Message restored');
              loadMessages();
            } catch (error) {
              toast.error('Failed to restore message');
              console.error(error);
            }
          }
        },
        duration: 5000,
      });
      
      setShowDeleteDialog(false);
      loadMessages();
    } catch (error) {
      toast.error('Failed to delete message');
      console.error(error);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await ApiService.markMessageAsRead(messageId);
      toast.success('Message marked as read');
      loadMessages();
    } catch (error) {
      toast.error('Failed to mark message as read');
      console.error(error);
    }
  };

  const getStatusBadge = (read: boolean) => {
    return read ? (
      <Badge variant="secondary">Read</Badge>
    ) : (
      <Badge variant="default">Unread</Badge>
    );
  };

  const getMessagePreview = (content: string) => {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };

  const handleCreateMessage = () => {
    setShowCreateDialog(true);
    setReceiverSearch('');
    setSelectedReceiver('');
    setMessageContent('');
  };

  const handleSendMessage = async () => {
    if (!selectedReceiver) {
      toast.error('Please select a recipient');
      return;
    }

    if (!messageContent.trim()) {
      toast.error('Message content is required');
      return;
    }

    if (!currentUser) {
      toast.error('You must be logged in to send messages');
      return;
    }

    setIsSending(true);
    try {
      await ApiService.createMessage({
        sender_id: currentUser.id,
        receiver_id: selectedReceiver,
        content: messageContent.trim(),
      });
      toast.success('Message sent successfully');
      setShowCreateDialog(false);
      setReceiverSearch('');
      setSelectedReceiver('');
      setMessageContent('');
      loadMessages();
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  // Filter users for receiver selection
  const filteredUsers = users.filter(user => {
    if (!receiverSearch.trim()) return true;
    const searchLower = receiverSearch.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  }).filter(user => user.id !== currentUser?.id); // Exclude current user

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message Management
            </CardTitle>
            <CardDescription>
              Monitor and manage user communications
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleCreateMessage}
              variant="default"
              className="shadow-lg hover:shadow-xl transition-all duration-200"
              style={{ 
                background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                color: 'white',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #4338ca)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #4f46e5)';
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-10 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'read' | 'unread')}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Messages</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMessages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No messages found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedMessages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{getSenderName(message.sender_id)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{getReceiverName(message.receiver_id)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="text-sm">{getMessagePreview(message.content)}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(message.read)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(message.sent_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" aria-label={`Actions for message from ${getSenderName(message.sender_id)}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(message)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {!message.read && (
                                <DropdownMenuItem onClick={() => handleMarkAsRead(message.id)}>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Mark as Read
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedMessage(message);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} messages
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <select
                    value={itemsPerPage.toString()}
                    onChange={(e) => {
                      const newItemsPerPage = parseInt(e.target.value, 10);
                      setItemsPerPage(newItemsPerPage);
                      setPagItemsPerPage(newItemsPerPage);
                    }}
                    className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={prevPage}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => goToPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={nextPage}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      {/* Message Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-h-[90vh] max-w-4xl w-[90vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>View complete message information</DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-1">From</h4>
                  <p className="text-sm text-muted-foreground">
                    {getSenderName(selectedMessage.sender_id)}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1">To</h4>
                  <p className="text-sm text-muted-foreground">
                    {getReceiverName(selectedMessage.receiver_id)}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1">Sent</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedMessage.sent_at)}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1">Status</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedMessage.read ? 'Read' : 'Unread'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-2">Message Content</h4>
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this message. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMessage} className="bg-destructive text-destructive-foreground">
              Delete Message
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Message Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>Send New Message</DialogTitle>
            <DialogDescription>
              Search for a user and send them a message
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Receiver Search */}
            <div className="space-y-2">
              <Label htmlFor="receiver-search">
                To <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="receiver-search"
                  placeholder="Search by name, email, or role..."
                  className="pl-10"
                  value={receiverSearch}
                  onChange={(e) => {
                    setReceiverSearch(e.target.value);
                    if (!e.target.value.trim()) {
                      setSelectedReceiver('');
                    }
                  }}
                />
              </div>
              
              {/* User List */}
              {receiverSearch.trim() && filteredUsers.length > 0 && (
                <div className="border rounded-md max-h-60 overflow-y-auto mt-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => {
                        setSelectedReceiver(user.id);
                        setReceiverSearch(`${user.name} (${user.email}) - ${user.role}`);
                      }}
                      className={`p-3 cursor-pointer hover:bg-accent transition-colors border-b last:border-b-0 ${
                        selectedReceiver === user.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {receiverSearch.trim() && filteredUsers.length === 0 && (
                <div className="p-3 border border-amber-200 bg-amber-50 rounded-md mt-2">
                  <p className="text-sm text-amber-800">
                    No users found matching "{receiverSearch}"
                  </p>
                </div>
              )}

              {selectedReceiver && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        Selected: {users.find(u => u.id === selectedReceiver)?.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedReceiver('');
                        setReceiverSearch('');
                      }}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Message Content */}
            <div className="space-y-2">
              <Label htmlFor="message-content">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message-content"
                placeholder="Type your message here..."
                rows={6}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {messageContent.length} characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setReceiverSearch('');
                setSelectedReceiver('');
                setMessageContent('');
              }}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !selectedReceiver || !messageContent.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0"
              style={{ 
                background: isSending || !selectedReceiver || !messageContent.trim()
                  ? '#9ca3af'
                  : 'linear-gradient(to right, #2563eb, #4f46e5)',
                color: 'white',
                border: 'none'
              }}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
