# Marine Water Quality in Hong Kong - Time Series Estimated from Satellite Images (2015-2021)

Supplementary materials used in the following journal article:

**Kwong, I. H. Y., Wong, F. K. K., & Fung, T. (2022). Automatic mapping and monitoring of marine water quality parameters in Hong Kong using Sentinel-2 image time-series and Google Earth Engine cloud computing. *Frontiers in Marine Science, 9*, 871470. doi: 10.3389/fmars.2022.871470**

Link to the article: https://www.frontiersin.org/articles/10.3389/fmars.2022.871470/

---

**Online application developed using Google Earth Engine:** https://khoyinivan.users.earthengine.app/view/marine-water-quality-hk
*   Source code of the web application: GEE_TimeSeriesApp.js

---

**Time-series video of the estimated water quality:** https://youtu.be/b2zwPFGDKY8

---

**Analysis codes:**

*   Part1_ImagePreprocessing.ipynb

*   Part2_ModelDevelopmentAndPrediction.ipynb

![khoyinivan users earthengine app_view_marine-water-quality-hk_Apr2022](https://user-images.githubusercontent.com/68047356/161700888-ca8e0ee7-b962-48e5-96da-e224ada1982a.png)

Other files:

*   **MarineQuality_2015-2020.csv**: Marine Water Quality data measured at different Marine Water Quality Monitoring stations in Hong Kong from 2015 to 2020; Gathered from DATA.GOV.HK (https://data.gov.hk/en-data/dataset/hk-epd-marineteam-marine-water-quality-historical-data-en)

*   **MonitoringStation_wgs84_76_shp.zip**: Locations of the 76 water quality monitoring stations in the open waters of Hong Kong (ESRI shapefile format); Equivalent to the Feature Collection ("users/khoyinivan/MonitoringStation_wgs84_76") in GEE; Extracted from Appendix A of the Annual Marine Water Quality Reports (https://www.epd.gov.hk/epd/english/environmentinhk/water/hkwqrc/waterquality/marine-2.html)

*Last updated in September 2022*
