====================
Mountain Top Removal
====================

This repository contains SkyTruth's Mountaintop Removal (MTR) Mining related work. We are using Google's `Earth Engine <https://earthengine.google.com/>`_ to identify active MTR mines on Landsat Satellite Imagery using a Normalized Differenced Vegetation Index (NDVI) threshold. To eliminate locations with NDVI reflectance values similar to mine sites a mask was created to block roads, rivers and streams, and urban areas from the analysis. Earth Engine is a cloud-based geospatial computing platform which we are utilizing to automate the process of mine identification.

This work is the continuation of SkyTruth's 2007 MTR mining project, which you can see on `cartoDB <https://skytruth-org.cartodb.com/viz/3c75f4b8-f5be-11e5-bfc2-0ef7f98ade21/public_map>`_ or read about `here <http://blog.skytruth.org/2009/12/measuring-mountaintop-removal-mining-in.html>`_, and relied upon a time-intensive manual classification of spectral imagery. By using Earth Engine we are able to automate the classification of active MTR sites.


Goals:
======
1. To produce a comprehensive map of MTR mining activity in Appalachia
2. To effectively measure the burden of reclamation
3. To infill gaps in the 2007 SkyTruth study, as well as update it with data from after 2005
4. To create an automated method of classifying MTR mining activity, in such a manner that it will be easily updated in the future.



License
=======

This work is licensed under the `Creative Commons Attribution 4.0 International License <http://creativecommons.org/licenses/by/4.0/>`_.

See ``LICENSE.txt``
