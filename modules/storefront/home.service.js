"use strict";

const { Op } = require("sequelize");
const Category = require("../category/model");
const Blog = require("../blog/model");
const InstagramReels = require("../instagramreels/model");
const NewsletterPost = require("../newsletter/post.model");
const Heroslider = require("../heroslider/model");
const SiteSetting = require("../sitesetting/model");
const { ProductService } = require("../product/service");

function getPublicBaseUrl() {
  if (process.env.API_PUBLIC_URL) {
    return String(process.env.API_PUBLIC_URL).replace(/\/$/, "");
  }
  const port = process.env.PORT || 4000;
  return `http://localhost:${port}`;
}

function resolveMediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(String(path))) return String(path);
  const base = getPublicBaseUrl();
  const normalized = String(path).startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

async function getSiteSettingJson(key, fallback = null) {
  const row = await SiteSetting.findOne({ where: { settingKey: key } });
  if (!row?.settingValue) return fallback;
  try {
    return JSON.parse(row.settingValue);
  } catch {
    return fallback;
  }
}

function formatDisplayDate(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function mapProductToCard(product, categoryById) {
  const price = product.salePrice ?? product.basePrice ?? 0;
  const oldPrice =
    product.basePrice != null && product.basePrice > price
      ? product.basePrice
      : undefined;
  let badge;
  if (product.stock <= 0) badge = "OUT OF STOCK";
  else if (product.isBestSeller) badge = "HOT PICK";

  const imagePath =
    product.image ||
    product.galleryImages?.[0]?.image ||
    product.allProductImages?.[0]?.image ||
    "";

  return {
    id: String(product.id),
    slug: product.slug,
    name: product.name,
    price,
    oldPrice,
    rating: 5,
    image: resolveMediaUrl(imagePath),
    badge,
    category: categoryById[product.categoryId]?.name,
    inStock: product.stock > 0,
  };
}

async function listActiveHeroSliders() {
  const now = new Date();
  return Heroslider.findAll({
    where: {
      isActive: true,
      startDate: { [Op.lte]: now },
      endDate: { [Op.gte]: now },
    },
    order: [
      ["rank", "ASC"],
      ["id", "ASC"],
    ],
    limit: 6,
  });
}

async function buildHomePageData() {
  const optionalDelayMs = parseInt(process.env.STOREFRONT_HOME_DELAY_MS || "0", 10);
  if (optionalDelayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, optionalDelayMs));
  }

  const categories = await Category.findAll({
    where: { isActive: true },
    order: [
      ["rank", "ASC"],
      ["id", "ASC"],
    ],
    limit: 12,
  });

  const categoryById = {};
  for (const row of categories) {
    categoryById[row.id] = row.get({ plain: true });
  }

  const categoryNames = categories.map((c) => c.name);

  const [
    heroRows,
    bestSellerData,
    newArrivalData,
    blogRows,
    reelRows,
    newsRows,
    announcement,
    features,
    testimonials,
    offerBanner,
    newsletter,
    footer,
    popularSearches,
  ] = await Promise.all([
    listActiveHeroSliders(),
    ProductService.findAllWithDetails({
      where: { isActive: true, isBestSeller: true },
      limit: 8,
      order: [["id", "DESC"]],
    }),
    ProductService.findAllWithDetails({
      where: { isActive: true, isNewArrival: true },
      limit: 8,
      order: [["id", "DESC"]],
    }),
    Blog.findAll({
      where: { status: "published" },
      order: [["published_at", "DESC"]],
      limit: 10,
    }),
    InstagramReels.findAll({
      where: { isActive: true },
      order: [
        ["rank", "ASC"],
        ["id", "ASC"],
      ],
      limit: 8,
    }),
    NewsletterPost.findAll({
      where: { status: "published" },
      order: [["published_at", "DESC"]],
      limit: 5,
    }),
    getSiteSettingJson("home_announcement", {
      text: "Hallmarked | 7-Day Return | Free Shipping on orders above ₹50,000",
    }),
    getSiteSettingJson("home_features", { items: [] }),
    getSiteSettingJson("home_testimonials", {
      title: "What Our Customers Say",
      items: [],
    }),
    getSiteSettingJson("home_offer_banner", null),
    getSiteSettingJson("home_newsletter", {
      title: "Subscribe to Our Newsletter",
      subtitle: "Get exclusive offers and style inspiration.",
    }),
    getSiteSettingJson("home_footer", null),
    getSiteSettingJson("home_popular_searches", null),
  ]);

  const mapProducts = (rows) =>
    rows.map((product) => mapProductToCard(product, categoryById));

  const blogsPlain = blogRows.map((b) => b.get({ plain: true }));
  const featuredBlog = blogsPlain.find((b) => b.isFeatured) || blogsPlain[0];
  const otherBlogs = blogsPlain
    .filter((b) => !featuredBlog || b.id !== featuredBlog.id)
    .slice(0, 3);

  const defaultFooter = {
    logoText: "Luxury Jewels",
    description:
      "Fine jewelry crafted with precision, featuring rings, earrings, necklaces, and bracelets designed for timeless elegance.",
    columns: [],
    copyright: `© ${new Date().getFullYear()} Luxury Jewels`,
  };

  return {
    announcement,
    hero: {
      slides: heroRows.map((row) => {
        const h = row.get({ plain: true });
        return {
          image: resolveMediaUrl(h.image),
          alt: h.title || h.subTitle || "Hero slide",
        };
      }),
    },
    exploreCategories: categories.map((c) => {
      const plain = c.get({ plain: true });
      return {
        name: plain.name,
        image: resolveMediaUrl(plain.image),
      };
    }),
    bestSellers: {
      categories: categoryNames,
      products: mapProducts(bestSellerData.rows),
    },
    newArrivals: {
      categories: categoryNames,
      products: mapProducts(newArrivalData.rows),
    },
    offerBanner: offerBanner?.image
      ? {
        image: resolveMediaUrl(offerBanner.image),
        alt: offerBanner.alt || "Limited-time jewellery offer",
      }
      : null,
    features,
    blogs: featuredBlog
      ? {
        title: "Blogs",
        featured: {
          date: formatDisplayDate(featuredBlog.published_at),
          title: featuredBlog.title,
          excerpt: featuredBlog.excerpt || "",
          image: resolveMediaUrl(featuredBlog.featuredImage),
          slug: featuredBlog.slug,
        },
        items: otherBlogs.map((b) => ({
          date: formatDisplayDate(b.published_at),
          title: b.title,
          excerpt: b.excerpt || "",
          image: resolveMediaUrl(b.featuredImage),
          slug: b.slug,
        })),
      }
      : { title: "Blogs", featured: null, items: [] },
    news: {
      title: "We Are Making News",
      items: newsRows.map((n) => {
        const row = n.get({ plain: true });
        return {
          title: row.title,
          excerpt: row.excerpt || "",
          image: resolveMediaUrl(row.featuredImage),
          href: "#",
        };
      }),
    },
    instagram: {
      title: "Follow Us on Instagram",
      handle: "@luxuryjewels",
      items: reelRows.map((r) => {
        const row = r.get({ plain: true });
        return {
          image: resolveMediaUrl(row.thumbnail),
          reelUrl: row.video,
          caption: row.caption,
        };
      }),
    },
    newsletter,
    footer: footer || defaultFooter,
    popularSearches,
    testimonials,
  };
}

module.exports = {
  buildHomePageData,
  resolveMediaUrl,
  getSiteSettingJson,
};
