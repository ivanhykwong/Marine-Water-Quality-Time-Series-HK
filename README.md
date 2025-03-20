# Marine Water Quality in Hong Kong - Time Series Estimated from Satellite Images (2015-2021)

Supplementary materials used in the following projects:

Journal article:

**Kwong, I. H. Y., Wong, F. K. K., & Fung, T. (2022). Automatic mapping and monitoring of marine water quality parameters in Hong Kong using Sentinel-2 image time-series and Google Earth Engine cloud computing. *Frontiers in Marine Science, 9*, 871470. doi: 10.3389/fmars.2022.871470**

Link to the article: https://www.frontiersin.org/articles/10.3389/fmars.2022.871470/

Award-winning ArcGIS Dashboard:

**Water Quality Monitoring From Satellite Imagery: A Case Study in Hong Kong. *Common Spatial Data Infrastructure (CSDI) Awards 2024 - Merit (Open Category).* https://csdigeolab.gov.hk/en/past-events/csdi-awards-2024

Project presentation slides: https://csdigeolab.gov.hk/images/CSDI_Awards_2024/brief/C4-23.pdf
ArcGIS Dashboard: https://www.arcgis.com/apps/dashboards/3b1a7e3a7ea640a1a2b2338cd774520a

---

**Online application developed using Google Earth Engine:** https://khoyinivan.users.earthengine.app/view/marine-water-quality-hk
*   Source code of the web application: GEE_TimeSeriesApp.js

**Time-series video of the estimated water quality:** https://youtu.be/b2zwPFGDKY8

---

**Additional tool to obtain the parameters related to atmospheric constituents required for 6S atmospheric correction, including Water Vapour, Ozone and Aerosol Optical Thickness:** https://khoyinivan.users.earthengine.app/view/atmospheric-constituents-for-6s
*   Source code of the web application: GEE_6S_AtmosphericParameter.js

---

**Analysis codes:** (Python API for GEE processing; used to produce the results in the journal article)

*   Part1_ImagePreprocessing.ipynb

*   Part2_ModelDevelopmentAndPrediction.ipynb

**Analysis codes:** (Python processing in local pc; used to produce the results in the ArcGIS Dashboard)

*   LocalProcessingPipeline_Part1_ArchivedImageDatabase.ipynb

*   LocalProcessingPipeline_Part2_NewlyAcquiredImage.ipynb

GEE application:
![khoyinivan users earthengine app_view_marine-water-quality-hk_Apr2022](https://user-images.githubusercontent.com/68047356/161700888-ca8e0ee7-b962-48e5-96da-e224ada1982a.png)

ArcGIS Dashboard:
![DashboardScreenshot](https://github.com/user-attachments/assets/04ee70e7-fe94-4495-9bad-4e19b949967f)

Other files:

*   **MarineQuality_2015-2020.csv**: Marine Water Quality data measured at different Marine Water Quality Monitoring stations in Hong Kong from 2015 to 2020; Gathered from DATA.GOV.HK (https://data.gov.hk/en-data/dataset/hk-epd-marineteam-marine-water-quality-historical-data-en)

*   **MonitoringStation_wgs84_76_shp.zip**: Locations of the 76 water quality monitoring stations in the open waters of Hong Kong (ESRI shapefile format); Equivalent to the Feature Collection ("users/khoyinivan/MonitoringStation_wgs84_76") in GEE; Extracted from Appendix A of the Annual Marine Water Quality Reports (https://www.epd.gov.hk/epd/english/environmentinhk/water/hkwqrc/waterquality/marine-2.html)

*Last updated in March 2025*
