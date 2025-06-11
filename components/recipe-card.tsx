"use client";

import { useState } from 'react';
import Image from 'next/image';
import { type RecipeWithAuthor } from '@/app/recipes-board/page';
import { RecipeModal } from './recipe-modal';

interface RecipeCardProps {
  recipe: RecipeWithAuthor;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className="bg-white/20 backdrop-blur-md rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:bg-white/30"
        onClick={() => setIsModalOpen(true)}
      >
        <Image
          src={`/img/noticeboard/recipes/${(parseInt(recipe.id, 36) % 8) + 1}.jpg`} // Fun way to get a random-ish sample image
          alt={recipe.name}
          width={400}
          height={250}
          className="object-cover w-full h-48"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-1 truncate">{recipe.name}</h3>
          <p className="text-sm text-muted-foreground mb-1">
            ✍️ by {recipe.author.firstName} {recipe.author.lastName}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(recipe.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* The Modal is rendered here but is only visible when isModalOpen is true */}
      <RecipeModal recipe={isModalOpen ? recipe : null} onClose={() => setIsModalOpen(false)} />
    </>
  );
}