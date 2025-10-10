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
import { Search, Eye, Trash2, MoreVertical, MessageSquare, User, Clock, Mail } from 'lucide-react';
import { Message, User as UserType } from '../../services/firestore.service';
import { FirestoreService } from '../../services/firestore.service';
import { toast } from 'sonner';
import { formatDate } from '../../utils/firebase-helpers';

interface MessageManagementProps {
  users: UserType[];
}

export function MessageManagement({ users }: MessageManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      // Get all messages by loading from all users
      const allMessages: Message[] = [];
      
      for (const user of users) {
        const sentMessages = await FirestoreService.getSentMessages(user.id);
        const receivedMessages = await FirestoreService.getReceivedMessages(user.id);
        allMessages.push(...sentMessages, ...receivedMessages);
      }
      
      // Remove duplicates
      const uniqueMessages = allMessages.filter((message, index, self) => 
        index === self.findIndex(m => m.id === message.id)
      );
      
      setMessages(uniqueMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(message => {
    const sender = users.find(u => u.id === message.sender_id);
    const receiver = users.find(u => u.id === message.receiver_id);
    
    const matchesSearch = (message.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (sender?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (receiver?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'read' && message.read) ||
                         (statusFilter === 'unread' && !message.read);
    
    return matchesSearch && matchesStatus;
  });

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

    try {
      await FirestoreService.deleteMessage(selectedMessage.id);
      toast.success('Message deleted successfully');
      setShowDeleteDialog(false);
      loadMessages();
    } catch (error) {
      toast.error('Failed to delete message');
      console.error(error);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await FirestoreService.markMessageAsRead(messageId);
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
          <div className="text-center py-8 text-muted-foreground">
            Loading messages...
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
                  {filteredMessages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No messages found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMessages.map((message) => (
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
                              <Button variant="ghost" size="sm">
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

            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredMessages.length} of {messages.length} messages
            </div>
          </>
        )}
      </CardContent>

      {/* Message Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
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
    </Card>
  );
}
