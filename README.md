# C-CDA HealthKit Generator

A simple web-based tool to create your own Consolidated Clinical Document Architecture (C-CDA) documents for importing lab results into Apple Health.

## 🎯 Purpose

Most healthcare providers don't implement C-CDA export for Apple Health. This tool lets you manually create compliant C-CDA XML files from your lab results that can be imported directly into the Apple Health app.

## ✨ Features

- **Simple & Clean Interface**: Easy-to-use web form for entering lab results
- **Patient Information**: Add your basic demographic information
- **Lab Results**: Add multiple lab test results with:
  - Test name and LOINC code (optional)
  - Result value and unit
  - Reference ranges (optional) - automatically flags out-of-range values
  - Test date
- **Privacy First**: All processing happens in your browser - no data is sent to any server
- **Download XML**: Generate and download C-CDA compliant XML files
- **Apple Health Compatible**: Generated files can be imported into Apple Health

## 🚀 Usage

1. Visit the [C-CDA HealthKit Generator](https://d33pk3rn3l.github.io/ccda-healthkit-generator/)
2. Fill in your patient information
3. Add your lab results (one or more)
4. Click "Generate & Download C-CDA XML"
5. Import the downloaded XML file into Apple Health

## 📱 Importing to Apple Health

1. Save the generated XML file to your iPhone (via AirDrop, iCloud, etc.)
2. Open the Health app
3. Tap your profile picture
4. Tap "Health Records"
5. Tap "Import Health Records"
6. Select the XML file

## 🛡️ Privacy

This tool runs entirely in your browser. No data is transmitted to any server. The source code is open and available for review.

## 📋 Technical Details

The tool generates C-CDA Release 2.1 compliant documents following the HL7 standard for laboratory results. Each document includes:
- Patient demographics
- Laboratory results with LOINC coding
- Reference ranges and interpretations
- Proper C-CDA structure and templates

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details
