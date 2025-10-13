import { CateringForm } from "@/components/catering-form";

export default function EventCateringPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8 flame-text">Event Catering</h1>
      <div className="max-w-3xl mx-auto">
        <CateringForm />
      </div>
    </div>
  );
}