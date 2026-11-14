import type { Property } from '@/types';
import { detailTier, isPlot } from '@/lib/routes';
import { PlotDetailContent } from './PlotDetailContent';
import { PlotDetailExclusiveContent } from './PlotDetailExclusiveContent';
import { PlotDetailFeaturedContent } from './PlotDetailFeaturedContent';
import { PropertyDetailContent } from './PropertyDetailContent';
import { PropertyDetailExclusiveContent } from './PropertyDetailExclusiveContent';
import { PropertyDetailFeaturedContent } from './PropertyDetailFeaturedContent';

interface Props {
  property: Property;
  similar: Property[];
}

/**
 * Chooses the page layout for a listing: plots get the plot layouts, everything else the building
 * layouts, each in a standard / featured / exclusive tier. The URL plays no part in this choice.
 */
const VIEWS = {
  plot: { standard: PlotDetailContent, featured: PlotDetailFeaturedContent, exclusive: PlotDetailExclusiveContent },
  building: {
    standard: PropertyDetailContent,
    featured: PropertyDetailFeaturedContent,
    exclusive: PropertyDetailExclusiveContent,
  },
} as const;

export function PropertyDetailView({ property, similar }: Props) {
  const View = VIEWS[isPlot(property) ? 'plot' : 'building'][detailTier(property)];
  return <View property={property} similar={similar} />;
}
