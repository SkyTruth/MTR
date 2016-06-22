====================
Mountain Top Removal
====================

This repository contains SkyTruth's Mountaintop Removal (MTR) Mining related work. We are using Google's `Earth Engine <https://earthengine.google.com/>`_ to identify active MTR mines in Landsat Satellite Imagery using a Normalized Differenced Vegetation Index (NDVI) threshold. To eliminate locations with NDVI reflectance values similar to mine sites a mask was created to block roads, rivers and streams, and urban areas from the analysis. This work is the continuation of SkyTruth's 2007 MTR mining project, which can be viewed on `cartoDB <https://skytruth-org.cartodb.com/viz/3c75f4b8-f5be-11e5-bfc2-0ef7f98ade21/public_map>`_, and relied upon a time-intensive manual classification of spectral imagery. 


Goals:
======
To produce a comprehensive map of MTR mining activity in Appalachia
To effectively measure the burden of reclamation
To infill gaps in the 2007 SkyTruth study, as well as update it with data from after 2005
To create an automated method of classifying MTR mining activity, in such a manner that it will be easily updated in the future.



License
=======

This work is licensed under the `Creative Commons Attribution 4.0 International License <http://creativecommons.org/licenses/by/4.0/>`_.

See ``LICENSE.txt``
