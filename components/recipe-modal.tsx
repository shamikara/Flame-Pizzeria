"use client";

import Image from 'next/image';
import { type RecipeWithAuthor } from '@/app/recipes-board/page'; // We'll define this type in the page

interface RecipeModalProps {
  recipe: RecipeWithAuthor | null;
  onClose: () => void;
}

export function RecipeModal({ recipe, onClose }: RecipeModalProps) {
  if (!recipe) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose} // Close modal on overlay click
    >
      <div 
        className="bg-[url('/img/noticeboard/board.png')] bg-cover bg-no-repeat bg-center p-8"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the content
      >
        <div className="relative bg-white/70 backdrop-blur-md rounded-lg shadow-xl max-w-2xl w-full p-6 text-center">
          <button
            className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-2xl"
            onClick={onClose}
          >
            ×
          </button>
          
          {/* For now we'll use a placeholder, you'd add an imageUrl to your Recipe model later */}
          <Image
            src={recipe.imageUrl || '/img/placeholder.jpg'} 
            alt={recipe.name}
            width={600}
            height={400}
            className="rounded-md mb-4 object-cover w-full h-64"
          />
          <h2 className="text-3xl font-bold mb-2 text-gray-800">{recipe.name}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            ✍️ By {recipe.author.firstName} {recipe.author.lastName} — {new Date(recipe.createdAt).toLocaleDateString()}
          </p>
          <p className="text-base text-gray-700 text-left whitespace-pre-wrap">
            {recipe.description}
          </p>
          <Separator className="my-4" />
           <p className="text-base text-gray-700 text-left whitespace-pre-wrap">
            {recipe.steps}
          </p>
        </div>
      </div>
    </div>
  );
}
// You might need to add a separator component from shadcn
// import { Separator } from "@/components/ui/separator";