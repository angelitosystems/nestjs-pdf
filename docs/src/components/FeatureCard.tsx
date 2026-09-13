import {
  Layers,
  Zap,
  ShieldCheck,
  Cpu,
  FileCode2,
  Sliders,
  HardDrive,
  Radio,
  Server,
} from 'lucide-react';

interface FeatureCardProps {
  id: string;
  title: string;
  description: string;
}

export function FeatureCard({ id, title, description }: FeatureCardProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case 'modular':
        return <Layers className="w-5 h-5 text-rose-500" />;
      case 'pool':
        return <Cpu className="w-5 h-5 text-cyan-500" />;
      case 'concurrency':
        return <Sliders className="w-5 h-5 text-amber-500" />;
      case 'security':
        return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      case 'templates':
        return <FileCode2 className="w-5 h-5 text-purple-500" />;
      case 'pagination':
        return <Zap className="w-5 h-5 text-blue-500" />;
      case 'storage':
        return <HardDrive className="w-5 h-5 text-teal-500" />;
      case 'streaming':
        return <Radio className="w-5 h-5 text-pink-500" />;
      case 'docker':
        return <Server className="w-5 h-5 text-indigo-500" />;
      default:
        return <Zap className="w-5 h-5 text-rose-500" />;
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-rose-500/40 dark:hover:border-rose-500/40 shadow-sm hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300 group flex flex-col justify-between">
      <div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
          {getIcon(id)}
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
