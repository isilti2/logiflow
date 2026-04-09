import CheckmarkItem from './CheckmarkItem';

interface FeatureCardProps {
  title: string;
  titleHighlight?: string;
  description: string;
  features: { text: string }[];
}

export default function FeatureCard({
  title,
  titleHighlight,
  description,
  features,
}: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-5 justify-center">
      <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
        {title}
        {titleHighlight && (
          <span className="text-blue-600">{titleHighlight}</span>
        )}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-base leading-relaxed max-w-md">{description}</p>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-1">
        {features.map((feature, index) => (
          <CheckmarkItem key={index} text={feature.text} />
        ))}
      </div>
    </div>
  );
}
