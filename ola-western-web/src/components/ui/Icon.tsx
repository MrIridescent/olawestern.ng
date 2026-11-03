interface IconProps {
  name: 'road' | 'market' | 'youth' | 'shield' | 'check' | 'flag' | 'map' | 'phone';
  className?: string;
}

export default function Icon({ name, className = 'h-7 w-7' }: IconProps) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'road':
      return (<svg {...common}><path d="M4 20 9 4M20 20 15 4M12 6v2M12 11v2M12 16v2" /></svg>);
    case 'market':
      return (<svg {...common}><path d="M3 9l1.5-5h15L21 9M3 9h18M5 9v11h14V9M9 20v-6h6v6" /></svg>);
    case 'youth':
      return (<svg {...common}><circle cx="12" cy="7" r="3.5" /><path d="M5 21c1-4 4-6 7-6s6 2 7 6" /></svg>);
    case 'shield':
      return (<svg {...common}><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9.5 12l2 2 3.5-4" /></svg>);
    case 'check':
      return (<svg {...common}><path d="M4 12.5l5 5L20 6.5" /></svg>);
    case 'flag':
      return (<svg {...common}><path d="M5 21V4M5 5c4-2 8 2 14 0v8c-6 2-10-2-14 0" /></svg>);
    case 'map':
      return (<svg {...common}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" /></svg>);
    case 'phone':
      return (<svg {...common}><path d="M8 3H5a2 2 0 0 0-2 2c0 9 8 17 16 16a2 2 0 0 0 2-2v-3l-4.5-1.5L13 18C9.5 16 7 13.5 6 10l3.5-2.5z" /></svg>);
  }
}
