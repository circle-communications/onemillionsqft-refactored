import { PropertyDetailView } from '@/components/property/detail/PropertyDetailView';
import { detailMetadata, loadDetail } from '@/lib/properties/detail';

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export const generateMetadata = ({ params }: Props) => detailMetadata(params.slug);

export default async function Page({ params }: Props) {
  const { property, similar } = await loadDetail(params.slug);
  return <PropertyDetailView property={property} similar={similar} />;
}
