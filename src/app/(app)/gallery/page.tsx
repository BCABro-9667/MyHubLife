
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlusCircle, Edit3, Trash2, ImageIcon as GalleryIcon, ArrowLeft, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useLocalStorage } from '@/lib/localStorage';
import type { Album, Photo } from '@/types';
import AppHeader from '@/components/layout/app-header';
import { EmptyState } from '@/components/empty-state';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const initialAlbumFormState: Omit<Album, 'id' | 'createdAt'> = { name: '', description: '', coverImageUrl: '', dataAiHint: 'abstract nature' };
const initialPhotoFormState: Omit<Photo, 'id' | 'createdAt' | 'albumId'> = { url: '', caption: '', dataAiHint: 'landscape' };

export default function GalleryPage() {
  const [albums, setAlbums] = useLocalStorage<Album[]>('gallery-albums', []);
  const [photos, setPhotos] = useLocalStorage<Photo[]>('gallery-photos', []);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [albumFormData, setAlbumFormData] = useState(initialAlbumFormState);

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [photoFormData, setPhotoFormData] = useState(initialPhotoFormState);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Album Handlers
  const handleAlbumInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAlbumFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAlbumSubmit = () => {
    if (albumFormData.name.trim() === '') {
      alert("Album name cannot be empty.");
      return;
    }
    const coverUrl = albumFormData.coverImageUrl?.trim() || `https://placehold.co/400x300.png`;

    if (editingAlbum) {
      setAlbums(
        albums.map((album) =>
          album.id === editingAlbum.id ? { ...editingAlbum, ...albumFormData, coverImageUrl:coverUrl } : album
        )
      );
    } else {
      const newAlbum: Album = {
        id: crypto.randomUUID(),
        ...albumFormData,
        coverImageUrl: coverUrl,
        dataAiHint: albumFormData.dataAiHint || 'gallery',
        createdAt: new Date().toISOString(),
      };
      setAlbums([...albums, newAlbum]);
    }
    setIsAlbumModalOpen(false);
    setAlbumFormData(initialAlbumFormState);
    setEditingAlbum(null);
  };

  const openEditAlbumModal = (album: Album) => {
    setEditingAlbum(album);
    setAlbumFormData({ name: album.name, description: album.description || '', coverImageUrl: album.coverImageUrl || '', dataAiHint: album.dataAiHint || 'gallery' });
    setIsAlbumModalOpen(true);
  };

  const openAddAlbumModal = () => {
    setEditingAlbum(null);
    setAlbumFormData(initialAlbumFormState);
    setIsAlbumModalOpen(true);
  };

  const handleDeleteAlbum = (id: string) => {
    if (window.confirm("Are you sure you want to delete this album and all its photos?")) {
      setAlbums(albums.filter((album) => album.id !== id));
      setPhotos(photos.filter((photo) => photo.albumId !== id));
      if (selectedAlbum?.id === id) {
        setSelectedAlbum(null);
      }
    }
  };

  // Photo Handlers
  const handlePhotoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPhotoFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoSubmit = () => {
    if (!selectedAlbum) return;
    if (photoFormData.url.trim() === '') {
      alert("Photo URL cannot be empty.");
      return;
    }
     const photoUrl = photoFormData.url?.trim() || `https://placehold.co/600x400.png`;

    if (editingPhoto) {
      setPhotos(
        photos.map((photo) =>
          photo.id === editingPhoto.id ? { ...editingPhoto, ...photoFormData, url: photoUrl } : photo
        )
      );
    } else {
      const newPhoto: Photo = {
        id: crypto.randomUUID(),
        albumId: selectedAlbum.id,
        ...photoFormData,
        url: photoUrl,
        dataAiHint: photoFormData.dataAiHint || 'photo',
        createdAt: new Date().toISOString(),
      };
      setPhotos([...photos, newPhoto]);
    }
    setIsPhotoModalOpen(false);
    setPhotoFormData(initialPhotoFormState);
    setEditingPhoto(null);
  };

  const openEditPhotoModal = (photo: Photo) => {
    setEditingPhoto(photo);
    setPhotoFormData({ url: photo.url, caption: photo.caption || '', dataAiHint: photo.dataAiHint || 'photo' });
    setIsPhotoModalOpen(true);
  };

  const openAddPhotoModal = () => {
    if (!selectedAlbum) return;
    setEditingPhoto(null);
    setPhotoFormData(initialPhotoFormState);
    setIsPhotoModalOpen(true);
  };

  const handleDeletePhoto = (id: string) => {
     if (window.confirm("Are you sure you want to delete this photo?")) {
        setPhotos(photos.filter((photo) => photo.id !== id));
     }
  };

  const albumPhotos = selectedAlbum ? photos.filter(p => p.albumId === selectedAlbum.id) : [];

  if (!mounted) {
    return (
      <div className="flex flex-col h-full">
        <AppHeader title="Photo Gallery" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex items-center justify-center">
          <GalleryIcon className="h-16 w-16 text-muted-foreground animate-pulse" />
        </main>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-full">
      <AppHeader title={selectedAlbum ? `Album: ${selectedAlbum.name}` : "Photo Gallery"}>
        {selectedAlbum ? (
          <>
            <Button onClick={() => setSelectedAlbum(null)} variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Albums
            </Button>
            <Button onClick={openAddPhotoModal} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Photo
            </Button>
          </>
        ) : (
          <Button onClick={openAddAlbumModal} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Album
          </Button>
        )}
      </AppHeader>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {!selectedAlbum ? (
          // Albums View
          albums.length === 0 ? (
            <EmptyState
              IconComponent={GalleryIcon}
              title="No Albums Yet"
              description="Create albums to organize your photos."
              actionButtonText="Create Your First Album"
              onActionClick={openAddAlbumModal}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {albums.map((album) => (
                <Card key={album.id} className="flex flex-col cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setSelectedAlbum(album)}>
                  <CardHeader className="relative aspect-[4/3] p-0">
                     <Image 
                        src={album.coverImageUrl || `https://placehold.co/400x300.png`} 
                        alt={album.name} 
                        width={400} 
                        height={300} 
                        className="object-cover w-full h-full rounded-t-lg"
                        data-ai-hint={album.dataAiHint || "gallery abstract"}
                      />
                  </CardHeader>
                  <CardContent className="pt-4 flex-grow">
                    <CardTitle className="truncate">{album.name}</CardTitle>
                    {album.description && <CardDescription className="line-clamp-2">{album.description}</CardDescription>}
                    <p className="text-xs text-muted-foreground mt-1">{photos.filter(p => p.albumId === album.id).length} photos</p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-1 pt-2">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditAlbumModal(album); }} aria-label="Edit album">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteAlbum(album.id); }} aria-label="Delete album">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )
        ) : (
          // Photos in Album View
          albumPhotos.length === 0 ? (
            <EmptyState
              IconComponent={Images}
              title="No Photos in This Album"
              description="Add photos to start building your collection."
              actionButtonText="Add First Photo"
              onActionClick={openAddPhotoModal}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {albumPhotos.map((photo) => (
                <Card key={photo.id} className="flex flex-col">
                  <CardHeader className="relative aspect-square p-0">
                     <Image 
                        src={photo.url} 
                        alt={photo.caption || 'Gallery photo'} 
                        width={400} 
                        height={400} 
                        className="object-cover w-full h-full rounded-t-lg"
                        data-ai-hint={photo.dataAiHint || "photo detail"}
                      />
                  </CardHeader>
                  {photo.caption && <CardContent className="pt-4 flex-grow"><CardDescription>{photo.caption}</CardDescription></CardContent>}
                  <CardFooter className="flex justify-end gap-1 pt-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditPhotoModal(photo)} aria-label="Edit photo">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeletePhoto(photo.id)} aria-label="Delete photo">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )
        )}
      </main>

      {/* Add/Edit Album Modal */}
      <Dialog open={isAlbumModalOpen} onOpenChange={setIsAlbumModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAlbum ? 'Edit' : 'Create'} Album</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input name="name" placeholder="Album Name" value={albumFormData.name} onChange={handleAlbumInputChange} />
            <Textarea name="description" placeholder="Description (Optional)" value={albumFormData.description} onChange={handleAlbumInputChange} />
            <Input name="coverImageUrl" placeholder="Cover Image URL (Optional, e.g. https://placehold.co/400x300.png)" value={albumFormData.coverImageUrl} onChange={handleAlbumInputChange} />
            <Input name="dataAiHint" placeholder="AI Hint for Cover (e.g. nature landscape)" value={albumFormData.dataAiHint} onChange={handleAlbumInputChange} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAlbumModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAlbumSubmit}>{editingAlbum ? 'Save Changes' : 'Create Album'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Photo Modal */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPhoto ? 'Edit' : 'Add'} Photo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input name="url" placeholder="Photo URL (e.g. https://placehold.co/600x400.png)" value={photoFormData.url} onChange={handlePhotoInputChange} />
            <Textarea name="caption" placeholder="Caption (Optional)" value={photoFormData.caption} onChange={handlePhotoInputChange} />
            <Input name="dataAiHint" placeholder="AI Hint for Photo (e.g. city night)" value={photoFormData.dataAiHint} onChange={handlePhotoInputChange} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPhotoModalOpen(false)}>Cancel</Button>
            <Button onClick={handlePhotoSubmit}>{editingPhoto ? 'Save Changes' : 'Add Photo'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
