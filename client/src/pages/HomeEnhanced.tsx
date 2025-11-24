import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE, getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Plus, ShoppingCart, Trash2, Copy, Clock, Globe } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function HomeEnhanced() {
  const { user, loading, isAuthenticated } = useAuth();
  const { language, setLanguage, t, isRTL } = useLanguage();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPasteDialogOpen, setIsPasteDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [pasteListName, setPasteListName] = useState("");

  const { data: lists, isLoading: listsLoading } = trpc.lists.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: history } = trpc.history.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const utils = trpc.useUtils();
  
  const createMutation = trpc.lists.create.useMutation({
    onSuccess: () => {
      utils.lists.getAll.invalidate();
      setIsCreateDialogOpen(false);
      setNewListName("");
      setNewListDescription("");
      toast.success(t('message.listCreated'));
    },
    onError: (error) => {
      toast.error(`Failed to create list: ${error.message}`);
    },
  });

  const pasteMutation = trpc.paste.parseAndCreate.useMutation({
    onSuccess: () => {
      utils.lists.getAll.invalidate();
      utils.history.getAll.invalidate();
      setIsPasteDialogOpen(false);
      setPastedText("");
      setPasteListName("");
      toast.success(t('message.listCreated'));
    },
    onError: (error) => {
      toast.error(`Failed to create list: ${error.message}`);
    },
  });

  const deleteMutation = trpc.lists.delete.useMutation({
    onSuccess: () => {
      utils.lists.getAll.invalidate();
      toast.success(t('message.listDeleted'));
    },
    onError: (error) => {
      toast.error(`Failed to delete list: ${error.message}`);
    },
  });

  const handleCreateList = () => {
    if (!newListName.trim()) {
      toast.error("Please enter a list name");
      return;
    }
    createMutation.mutate({
      name: newListName,
      description: newListDescription || undefined,
    });
  };

  const handlePasteList = () => {
    if (!pasteListName.trim()) {
      toast.error("Please enter a list name");
      return;
    }
    if (!pastedText.trim()) {
      toast.error("Please paste items");
      return;
    }
    pasteMutation.mutate({
      listName: pasteListName,
      pastedText,
      description: undefined,
    });
  };

  const handleDeleteList = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  if (loading || listsLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 animate-pulse mx-auto text-green-600" />
          <p className="mt-4 text-gray-600">{t('Loading...')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <CardTitle className="text-3xl">{t('app.title')}</CardTitle>
            <CardDescription>{t('app.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <a href={getLoginUrl()}>{t('Sign In to Get Started')}</a>
            </Button>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === 'en' ? 'he' : 'en')}
              >
                <Globe className="w-4 h-4 mr-1" />
                {language === 'en' ? 'עברית' : 'English'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className={`container max-w-6xl py-8 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title.myLists')}</h1>
            <p className="text-gray-600">{t('app.subtitle')}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('button.newList')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('title.createList')}</DialogTitle>
                  <DialogDescription>{t('Add a new list to organize your shopping items')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('label.listName')}</Label>
                    <Input
                      id="name"
                      placeholder={t('e.g., Weekly Groceries')}
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateList();
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {t('Cancel')}
                  </Button>
                  <Button 
                    onClick={handleCreateList} 
                    disabled={createMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {createMutation.isPending ? t('Creating...') : t('Create List')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isPasteDialogOpen} onOpenChange={setIsPasteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  <Copy className="w-4 h-4 mr-2" />
                  {t('button.paste')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('title.pasteList')}</DialogTitle>
                  <DialogDescription>{t('Paste items from WhatsApp or any other source')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="paste-name">{t('label.listName')}</Label>
                    <Input
                      id="paste-name"
                      placeholder={t('e.g., Weekly Groceries')}
                      value={pasteListName}
                      onChange={(e) => setPasteListName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paste-text">{t('label.pasteItems')}</Label>
                    <Textarea
                      id="paste-text"
                      placeholder={t('label.pasteItems')}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      rows={6}
                      className="border-orange-300 focus:border-orange-500"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPasteDialogOpen(false)}>
                    {t('Cancel')}
                  </Button>
                  <Button 
                    onClick={handlePasteList} 
                    disabled={pasteMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {pasteMutation.isPending ? t('Creating...') : t('Create List')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            >
              <Clock className="w-4 h-4 mr-2" />
              {t('button.history')}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'he' : 'en')}
            >
              <Globe className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isHistoryOpen && history && history.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('title.history')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-100">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.itemCount} items</p>
                    </div>
                    <p className="text-sm text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              <CardTitle>{t('title.yourLists')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {!lists || lists.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">{t('message.noLists')}</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {lists.map((list) => (
                  <Card key={list.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Link href={`/lists/${list.id}`}>
                          <CardTitle className="hover:text-green-600 cursor-pointer">{list.name}</CardTitle>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteList(list.id, list.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {list.description && (
                        <CardDescription className="line-clamp-2">{list.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Link href={`/lists/${list.id}`}>
                        <Button variant="outline" className="w-full">
                          {t('View Items')}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
