import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import productsData from '../data/products.json';

interface ProductItem {
  sku_code: string;
  product_category: string;
  product_name: string;
  bag_type?: string;
  material?: string;
  image_url?: string;
  description: string;
  ply_options?: string[];
  capacity_options?: string[];
  lamination_options?: string[];
  material_options?: string[];
  construction_options?: string[];
  industries?: string[];
  status?: string;
}

const industryMeta: Record<string, { title: string; desc: string; keywords: string; name: string }> = {
  'construction-materials': {
    name: 'Construction Materials',
    title: 'Construction Materials Packaging Bags | Cement, Mortar & Drymix Sacks | Baachko',
    desc: 'Heavy-duty packaging for building materials: Cement valve sacks, drymix mortar paper bags, tile adhesive packaging, and puncture-resistant moisture-barrier sacks.',
    keywords: 'cement valve bags, drymix mortar sacks, building material packaging, kraft valve sacks, construction packaging bags, tile adhesive sacks, Baachko'
  },
  'chemicals': {
    name: 'Chemicals',
    title: 'Chemical Packaging Sacks | Polymer, Pigment & Mineral Bags | Baachko',
    desc: 'High-integrity packaging for chemicals, polymers, fertilizers, masterbatches, and fine powders. Leak-proof multiwall paper sacks and HDPE coated woven bags.',
    keywords: 'chemical packaging sacks, polymer granule bags, fertilizer sacks, masterbatch bags, chemical grade kraft sacks, leak-proof industrial bags, Baachko'
  },
  'agriculture-food-ingredients': {
    name: 'Agriculture & Food Ingredients',
    title: 'Agriculture & Food Ingredients Packaging | Flour, Grain & Sugar Sacks | Baachko',
    desc: 'Food-safe packaging solutions for flour, sugar, spices, grain, and agricultural produce. Multiwall kraft paper sacks, BOPP bags, and breathable natural jute gunny bags.',
    keywords: 'flour sacks, food grade kraft bags, sugar packaging, grain sacks, agricultural packaging, jute gunny bags, BOPP rice bags, Baachko'
  },
  'animal-feed': {
    name: 'Animal Feed',
    title: 'Animal Feed & Nutrition Packaging Bags | Cattle, Poultry & Aqua Feed | Baachko',
    desc: 'Durable, moisture-resistant packaging for animal nutrition, cattle feed, poultry feed, and aqua feed. High-tensile PP woven and BOPP laminated bags.',
    keywords: 'animal feed bags, cattle feed sacks, poultry feed packaging, aqua feed bags, PP woven sacks, BOPP laminated animal feed bags, Baachko'
  },
  'other-industrial-applications': {
    name: 'Other Industrial Applications',
    title: 'Bulk Material Handling & FIBC Jumbo Bags | Industrial Storage | Baachko',
    desc: 'Heavy-duty bulk handling packaging: Flexible Intermediate Bulk Containers (FIBC), 1-2 Ton Jumbo Bags, circular and U-panel bags for safe industrial transport.',
    keywords: 'FIBC jumbo bags, bulk bags 1 ton 2 ton, circular jumbo bags, flexible intermediate bulk container, heavy duty industrial bulk sacks, Baachko'
  }
};

function setOrCreateMeta(name: string, content: string, isProperty = false) {
  const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let meta = document.querySelector(selector);
  if (!meta) {
    meta = document.createElement('meta');
    if (isProperty) {
      meta.setAttribute('property', name);
    } else {
      meta.setAttribute('name', name);
    }
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

/**
 * Robot component to dynamically enforce:
 * 1. Search engine & AI crawler indexing rules (Google AI, Gemini, SGE, Bing Copilot)
 * 2. Canonical URL tags
 * 3. Dynamic route-specific SEO titles, descriptions, and keywords
 * 4. OpenGraph & Twitter Card high-resolution image links for AI previews
 * 5. Dynamic Schema.org BreadcrumbList, Product, and CollectionPage JSON-LD graphs
 */
export default function Robot() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    const isAdminRoute = pathname.startsWith('/adminpanel') || pathname.startsWith('/admin');

    // 1. Manage robots, googlebot, and google-extended meta tags
    if (isAdminRoute) {
      setOrCreateMeta('robots', 'noindex, nofollow, noarchive, nosnippet');
      setOrCreateMeta('googlebot', 'noindex, nofollow');
      setOrCreateMeta('google-extended', 'noindex, nofollow');
    } else {
      setOrCreateMeta('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
      setOrCreateMeta('googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
      setOrCreateMeta('google-extended', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    }

    // 2. Manage canonical URL link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }

    if (isAdminRoute) {
      canonicalLink.removeAttribute('href');
    } else {
      const cleanPath = pathname === '/' ? '' : pathname;
      canonicalLink.setAttribute('href', `https://www.baachko.com${cleanPath}`);
    }

    // 3. Dynamic Page Titles, Descriptions, Keywords and Image Previews
    let pageTitle = 'Baachko | Heavy-Duty Industrial Packaging Solutions | Kraft Sacks, PP Woven & FIBC Bags';
    let pageDesc = 'Baachko is a premier industrial packaging manufacturer in India with 50+ years of expertise. Multiwall Kraft Paper Sacks, Valve Bags, HDPE Coated Sacks, PP Woven Sacks, BOPP Bags, and FIBC Jumbo Bags.';
    let pageKeywords = 'Multiwall Kraft Paper Sacks, Kraft Valve Sacks, HDPE Coated Kraft Paper Sacks, PP Woven Sacks, BOPP Bags, Jute Gunny Bags, FIBC Jumbo Bags, Industrial Packaging Manufacturer, Navi Mumbai Packaging Factory, Baachko';
    let pageImageUrl = 'https://www.baachko.com/hero-poster.webp';

    let breadcrumbs: Array<{ position: number; name: string; item: string }> = [
      { position: 1, name: 'Home', item: 'https://www.baachko.com/' }
    ];

    if (isAdminRoute) {
      pageTitle = 'Admin Portal | Baachko Packaging';
      pageDesc = 'Baachko Internal Administration Console.';
      pageKeywords = '';
    } else if (pathname === '/about') {
      pageTitle = 'About Us | 50+ Years of Industrial Packaging Excellence | Baachko';
      pageDesc = 'Learn about Baachko (Krishna Packers). Founded in 1974, providing high-integrity, sustainable packaging solutions across India and globally.';
      pageKeywords = 'About Baachko, Krishna Packers history, packaging manufacturer Navi Mumbai, ISO certified packaging, packaging company profile';
      breadcrumbs.push({ position: 2, name: 'About Us', item: 'https://www.baachko.com/about' });
    } else if (pathname === '/products' || pathname === '/our-products') {
      pageTitle = 'Industrial Packaging Products | Multiwall Paper Sacks & Woven Bags | Baachko';
      pageDesc = 'Browse our complete catalog of industrial sacks: Multiwall Kraft Paper Sacks, Valve Bags, HDPE Coated Bags, PP Woven Sacks, BOPP Bags, Jute Bags, and FIBC Bags.';
      pageKeywords = 'industrial packaging products, multiwall bags catalog, kraft sacks list, PP woven bag manufacturer, industrial bags supplier, Baachko products';
      breadcrumbs.push({ position: 2, name: 'Our Products', item: 'https://www.baachko.com/our-products' });
    } else if (pathname.startsWith('/industry/')) {
      const industryId = pathname.replace('/industry/', '');
      const indInfo = industryMeta[industryId];
      if (indInfo) {
        pageTitle = indInfo.title;
        pageDesc = indInfo.desc;
        pageKeywords = indInfo.keywords;
        breadcrumbs.push({ position: 2, name: 'Industries', item: 'https://www.baachko.com/our-products' });
        breadcrumbs.push({ position: 3, name: indInfo.name, item: `https://www.baachko.com/industry/${industryId}` });
      }
    } else if (pathname.startsWith('/product/')) {
      const sku = pathname.replace('/product/', '');
      const product = (productsData as ProductItem[]).find(p => p.sku_code === sku);
      if (product) {
        pageTitle = `${product.product_name} (${product.product_category}) | Baachko Packaging`;
        const cap = product.capacity_options ? ` Capacities: ${product.capacity_options.join(', ')}.` : '';
        pageDesc = `${product.description}${cap} Engineered for heavy-duty industrial performance by Baachko.`;
        pageKeywords = `${product.product_name}, ${product.product_category}, ${product.material || ''}, industrial sacks, packaging India, Baachko`;
        if (product.image_url) {
          pageImageUrl = `https://www.baachko.com${product.image_url}`;
        }
        breadcrumbs.push({ position: 2, name: 'Products', item: 'https://www.baachko.com/our-products' });
        breadcrumbs.push({ position: 3, name: product.product_name, item: `https://www.baachko.com/product/${product.sku_code}` });
      }
    } else if (pathname === '/gallery') {
      pageTitle = 'Infrastructure & Manufacturing Plant | Quality & Testing Lab | Baachko';
      pageDesc = 'Explore Baachko’s cutting-edge packaging infrastructure in Navi Mumbai: automated paper bag tubing lines, flexo printing, and tensile testing labs.';
      pageKeywords = 'packaging factory Navi Mumbai, kraft sack manufacturing plant, bag testing lab, packaging machinery, Baachko infrastructure';
      breadcrumbs.push({ position: 2, name: 'Infrastructure', item: 'https://www.baachko.com/gallery' });
    } else if (pathname === '/privacy-policy') {
      pageTitle = 'Privacy Policy | Baachko Packaging';
      pageDesc = 'Privacy policy and data protection terms for Baachko (Krishna Packers).';
      pageKeywords = 'privacy policy, terms of service, Baachko data policy';
      breadcrumbs.push({ position: 2, name: 'Privacy Policy', item: 'https://www.baachko.com/privacy-policy' });
    }

    document.title = pageTitle;
    setOrCreateMeta('description', pageDesc);
    setOrCreateMeta('keywords', pageKeywords);

    // OpenGraph and Twitter sync with high-res image
    setOrCreateMeta('og:title', pageTitle, true);
    setOrCreateMeta('og:description', pageDesc, true);
    setOrCreateMeta('og:image', pageImageUrl, true);
    setOrCreateMeta('og:image:secure_url', pageImageUrl, true);
    setOrCreateMeta('og:url', `https://www.baachko.com${pathname === '/' ? '' : pathname}`, true);
    setOrCreateMeta('twitter:title', pageTitle);
    setOrCreateMeta('twitter:description', pageDesc);
    setOrCreateMeta('twitter:image', pageImageUrl);

    // Dynamic Schema Injection (Clean up previous route schemas)
    const existingDynamicSchemas = document.querySelectorAll('script[data-dynamic-seo="true"]');
    existingDynamicSchemas.forEach(el => el.remove());

    if (!isAdminRoute) {
      // 1. Dynamic BreadcrumbList Schema for Google AI Search
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbs.map(b => ({
          '@type': 'ListItem',
          'position': b.position,
          'name': b.name,
          'item': b.item
        }))
      };

      const breadcrumbScript = document.createElement('script');
      breadcrumbScript.setAttribute('data-dynamic-seo', 'true');
      breadcrumbScript.type = 'application/ld+json';
      breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(breadcrumbScript);

      // 2. Dynamic Product Schema on /product/:id
      if (pathname.startsWith('/product/')) {
        const sku = pathname.replace('/product/', '');
        const product = (productsData as ProductItem[]).find(p => p.sku_code === sku);
        if (product) {
          const additionalProperties = [];
          if (product.bag_type) {
            additionalProperties.push({ '@type': 'PropertyValue', 'name': 'Bag Type', 'value': product.bag_type });
          }
          if (product.ply_options?.length) {
            additionalProperties.push({ '@type': 'PropertyValue', 'name': 'Ply / Construction Options', 'value': product.ply_options.join(', ') });
          }
          if (product.capacity_options?.length) {
            additionalProperties.push({ '@type': 'PropertyValue', 'name': 'Capacity Options', 'value': product.capacity_options.join(', ') });
          }
          if (product.lamination_options?.length) {
            additionalProperties.push({ '@type': 'PropertyValue', 'name': 'Lamination Options', 'value': product.lamination_options.join(', ') });
          }
          if (product.material_options?.length) {
            additionalProperties.push({ '@type': 'PropertyValue', 'name': 'Material Options', 'value': product.material_options.join(', ') });
          }
          if (product.industries?.length) {
            additionalProperties.push({ '@type': 'PropertyValue', 'name': 'Target Industries', 'value': product.industries.join(', ') });
          }

          const productSchema = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            '@id': `https://www.baachko.com/product/${product.sku_code}#product`,
            'name': product.product_name,
            'image': `https://www.baachko.com${product.image_url}`,
            'description': product.description,
            'sku': product.sku_code,
            'mpn': product.sku_code,
            'category': product.product_category,
            'material': product.material,
            'brand': {
              '@type': 'Brand',
              'name': 'Baachko'
            },
            'manufacturer': {
              '@type': 'Organization',
              'name': 'Baachko',
              'url': 'https://www.baachko.com'
            },
            'additionalProperty': additionalProperties,
            'offers': {
              '@type': 'AggregateOffer',
              'url': `https://www.baachko.com/product/${product.sku_code}`,
              'priceCurrency': 'INR',
              'lowPrice': '10',
              'offerCount': '10000',
              'availability': 'https://schema.org/InStock',
              'itemCondition': 'https://schema.org/NewCondition',
              'seller': {
                '@type': 'Organization',
                'name': 'Baachko'
              }
            }
          };

          const productScript = document.createElement('script');
          productScript.setAttribute('data-dynamic-seo', 'true');
          productScript.type = 'application/ld+json';
          productScript.textContent = JSON.stringify(productSchema);
          document.head.appendChild(productScript);
        }
      }

      // 3. Dynamic CollectionPage / Service Schema on /industry/:industryId
      if (pathname.startsWith('/industry/')) {
        const industryId = pathname.replace('/industry/', '');
        const indInfo = industryMeta[industryId];
        if (indInfo) {
          const industryProducts = (productsData as ProductItem[]).filter(p => p.industries?.includes(industryId));
          const industrySchema = {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            '@id': `https://www.baachko.com/industry/${industryId}#collection`,
            'name': `${indInfo.name} Packaging Solutions`,
            'description': indInfo.desc,
            'url': `https://www.baachko.com/industry/${industryId}`,
            'provider': {
              '@type': 'Organization',
              'name': 'Baachko',
              'url': 'https://www.baachko.com'
            },
            'mainEntity': {
              '@type': 'ItemList',
              'name': `Packaging Products for ${indInfo.name}`,
              'itemListElement': industryProducts.map((p, idx) => ({
                '@type': 'ListItem',
                'position': idx + 1,
                'name': p.product_name,
                'url': `https://www.baachko.com/product/${p.sku_code}`,
                'image': `https://www.baachko.com${p.image_url}`,
                'description': p.description
              }))
            }
          };

          const indScript = document.createElement('script');
          indScript.setAttribute('data-dynamic-seo', 'true');
          indScript.type = 'application/ld+json';
          indScript.textContent = JSON.stringify(industrySchema);
          document.head.appendChild(indScript);
        }
      }
    }
  }, [location.pathname]);

  return null;
}
