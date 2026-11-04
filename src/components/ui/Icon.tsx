import { Check, Flag, Map, Phone, Shield, Road, Building, Users } from 'lucide-react';

interface IconProps {
  name: 'road' | 'market' | 'youth' | 'shield' | 'check' | 'flag' | 'map' | 'phone';
  className?: string;
}

export default function Icon({ name, className = 'h-7 w-7' }: IconProps) {
  const common = { className, strokeWidth: 1.8, 'aria-hidden': true };

  switch (name) {
    case 'road':
      return <Road {...common} />;
    case 'market':
      return <Building {...common} />;
    case 'youth':
      return <Users {...common} />;
    case 'shield':
      return <Shield {...common} />;
    case 'check':
      return <Check {...common} />;
    case 'flag':
      return <Flag {...common} />;
    case 'map':
      return <Map {...common} />;
    case 'phone':
      return <Phone {...common} />;
  }
}