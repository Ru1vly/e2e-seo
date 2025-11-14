import { chromium, Browser, Page } from 'playwright';
import { SEOCheckerOptions, SEOReport } from './types';
import { MetaTagsChecker } from './checkers/metaTags';
import { HeadingsChecker } from './checkers/headings';
import { ImagesChecker } from './checkers/images';
import { PerformanceChecker } from './checkers/performance';
import { RobotsTxtChecker } from './checkers/robotsTxt';
import { SitemapChecker } from './checkers/sitemap';
import { SecurityChecker } from './checkers/security';
import { StructuredDataChecker } from './checkers/structuredData';
import { SocialMediaChecker } from './checkers/socialMedia';
import { ContentChecker } from './checkers/content';
import { LinksChecker } from './checkers/links';
import { UIElementsChecker } from './checkers/uiElements';
import { TechnicalChecker } from './checkers/technical';
import { AccessibilityChecker } from './checkers/accessibility';
import { URLFactorsChecker } from './checkers/urlFactors';
import { SpamDetectionChecker } from './checkers/spamDetection';
import { PageQualityChecker } from './checkers/pageQuality';
import { AdvancedImagesChecker } from './checkers/advancedImages';
import { MultimediaChecker } from './checkers/multimedia';
import { CoreWebVitalsChecker } from './checkers/coreWebVitals';
import { AnalyticsChecker } from './checkers/analytics';
import { MobileUXChecker } from './checkers/mobileUX';
import { SchemaValidationChecker } from './checkers/schemaValidation';
import { ResourceOptimizationChecker } from './checkers/resourceOptimization';
import { LegalComplianceChecker } from './checkers/legalCompliance';
import { EcommerceChecker } from './checkers/ecommerce';
import { InternationalizationChecker } from './checkers/internationalization';

export class SEOChecker {
  private browser: Browser | null = null;
  private page: Page | null = null;

  constructor(private options: SEOCheckerOptions) {
    this.options.headless = options.headless !== false;
    this.options.timeout = options.timeout || 30000;
    this.options.viewport = options.viewport || { width: 1920, height: 1080 };
  }

  async check(): Promise<SEOReport> {
    try {
      await this.launch();
      await this.navigate();

      const metaTagsChecker = new MetaTagsChecker(this.page!);
      const headingsChecker = new HeadingsChecker(this.page!);
      const imagesChecker = new ImagesChecker(this.page!);
      const performanceChecker = new PerformanceChecker(this.page!);
      const robotsTxtChecker = new RobotsTxtChecker(this.page!);
      const sitemapChecker = new SitemapChecker(this.page!);
      const securityChecker = new SecurityChecker(this.page!);
      const structuredDataChecker = new StructuredDataChecker(this.page!);
      const socialMediaChecker = new SocialMediaChecker(this.page!);
      const contentChecker = new ContentChecker(this.page!);
      const linksChecker = new LinksChecker(this.page!);
      const uiElementsChecker = new UIElementsChecker(this.page!);
      const technicalChecker = new TechnicalChecker(this.page!);
      const accessibilityChecker = new AccessibilityChecker(this.page!);
      const urlFactorsChecker = new URLFactorsChecker(this.page!);
      const spamDetectionChecker = new SpamDetectionChecker(this.page!);
      const pageQualityChecker = new PageQualityChecker(this.page!);
      const advancedImagesChecker = new AdvancedImagesChecker(this.page!);
      const multimediaChecker = new MultimediaChecker(this.page!);
      const coreWebVitalsChecker = new CoreWebVitalsChecker(this.page!);
      const analyticsChecker = new AnalyticsChecker(this.page!);
      const mobileUXChecker = new MobileUXChecker(this.page!);
      const schemaValidationChecker = new SchemaValidationChecker(this.page!);
      const resourceOptimizationChecker = new ResourceOptimizationChecker(this.page!);
      const legalComplianceChecker = new LegalComplianceChecker(this.page!);
      const ecommerceChecker = new EcommerceChecker(this.page!);
      const internationalizationChecker = new InternationalizationChecker(this.page!);

      const [metaTags, headings, images, performance, robotsTxt, sitemap, security, structuredData, socialMedia, content, links, uiElements, technical, accessibility, urlFactors, spamDetection, pageQuality, advancedImages, multimedia, coreWebVitals, analytics, mobileUX, schemaValidation, resourceOptimization, legalCompliance, ecommerce, internationalization] = await Promise.all([
        metaTagsChecker.checkAll(),
        headingsChecker.checkAll(),
        imagesChecker.checkAll(),
        performanceChecker.checkAll(),
        robotsTxtChecker.checkAll(),
        sitemapChecker.checkAll(),
        securityChecker.checkAll(),
        structuredDataChecker.checkAll(),
        socialMediaChecker.checkAll(),
        contentChecker.checkAll(),
        linksChecker.checkAll(),
        uiElementsChecker.checkAll(),
        technicalChecker.checkAll(),
        accessibilityChecker.checkAll(),
        urlFactorsChecker.checkAll(),
        spamDetectionChecker.checkAll(),
        pageQualityChecker.checkAll(),
        advancedImagesChecker.checkAll(),
        multimediaChecker.checkAll(),
        coreWebVitalsChecker.checkAll(),
        analyticsChecker.checkAll(),
        mobileUXChecker.checkAll(),
        schemaValidationChecker.checkAll(),
        resourceOptimizationChecker.checkAll(),
        legalComplianceChecker.checkAll(),
        ecommerceChecker.checkAll(),
        internationalizationChecker.checkAll(),
      ]);

      const allChecks = [...metaTags, ...headings, ...images, ...performance, ...robotsTxt, ...sitemap, ...security, ...structuredData, ...socialMedia, ...content, ...links, ...uiElements, ...technical, ...accessibility, ...urlFactors, ...spamDetection, ...pageQuality, ...advancedImages, ...multimedia, ...coreWebVitals, ...analytics, ...mobileUX, ...schemaValidation, ...resourceOptimization, ...legalCompliance, ...ecommerce, ...internationalization];
      const passed = allChecks.filter((c) => c.passed).length;
      const failed = allChecks.filter((c) => !c.passed).length;
      const score = Math.round((passed / allChecks.length) * 100);

      return {
        url: this.options.url,
        timestamp: new Date().toISOString(),
        checks: {
          metaTags,
          headings,
          images,
          performance,
          robotsTxt,
          sitemap,
          security,
          structuredData,
          socialMedia,
          content,
          links,
          uiElements,
          technical,
          accessibility,
          urlFactors,
          spamDetection,
          pageQuality,
          advancedImages,
          multimedia,
          coreWebVitals,
          analytics,
          mobileUX,
          schemaValidation,
          resourceOptimization,
          legalCompliance,
          ecommerce,
          internationalization,
        },
        score,
        summary: {
          total: allChecks.length,
          passed,
          failed,
        },
      };
    } finally {
      await this.close();
    }
  }

  private async launch(): Promise<void> {
    this.browser = await chromium.launch({
      headless: this.options.headless,
    });

    this.page = await this.browser.newPage({
      viewport: this.options.viewport,
    });

    await this.page.setDefaultTimeout(this.options.timeout!);
  }

  private async navigate(): Promise<void> {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }

    await this.page.goto(this.options.url, {
      waitUntil: 'domcontentloaded',
    });
  }

  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

export * from './types';
export { MetaTagsChecker } from './checkers/metaTags';
export { HeadingsChecker } from './checkers/headings';
export { ImagesChecker } from './checkers/images';
export { PerformanceChecker } from './checkers/performance';
export { RobotsTxtChecker } from './checkers/robotsTxt';
export { SitemapChecker } from './checkers/sitemap';
export { SecurityChecker } from './checkers/security';
export { StructuredDataChecker } from './checkers/structuredData';
export { SocialMediaChecker } from './checkers/socialMedia';
export { ContentChecker } from './checkers/content';
export { LinksChecker } from './checkers/links';
export { UIElementsChecker } from './checkers/uiElements';
export { TechnicalChecker } from './checkers/technical';
export { AccessibilityChecker } from './checkers/accessibility';
export { URLFactorsChecker } from './checkers/urlFactors';
export { SpamDetectionChecker } from './checkers/spamDetection';
export { PageQualityChecker } from './checkers/pageQuality';
export { AdvancedImagesChecker } from './checkers/advancedImages';
export { MultimediaChecker } from './checkers/multimedia';
export { CoreWebVitalsChecker } from './checkers/coreWebVitals';
export { AnalyticsChecker } from './checkers/analytics';
export { MobileUXChecker } from './checkers/mobileUX';
export { SchemaValidationChecker } from './checkers/schemaValidation';
export { ResourceOptimizationChecker } from './checkers/resourceOptimization';
export { LegalComplianceChecker } from './checkers/legalCompliance';
export { EcommerceChecker } from './checkers/ecommerce';
export { InternationalizationChecker } from './checkers/internationalization';
