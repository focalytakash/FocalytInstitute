const mongoose = require("mongoose");
const {
	Candidate,
	CandidateQualification,
	CandidateCareer,
	CandidateProject,
	CandidateReference,
} = require("../../models");

module.exports.register = async (req, res) => {
	try {
		const { _id } = req.user;
		const { mobile } = req.body;
		const candExist = await Candidate.findOne({ _id: { $ne: _id }, mobile });
		if (candExist) throw req.ykError("Mobile number already exist!");
		const candidate = await Candidate.findByIdAndUpdate(
			{ _id },
			{ ...req.body, isProfileCompleted: true },
			{ new: true }
		);
		if (!candidate)
			throw req.ykError("Candidate not register now. Try again later!");
		return res.send({
			status: true,
			message: "Candidate register successfully!",
			data: { candidate },
		});
	} catch (err) {
		return req.errFunc(err);
	}
};

module.exports.getProfileDetail = async (req, res) => {
	try {
		const { _id } = req.user;
		const $match = {
			$match: {
				_id: mongoose.Types.ObjectId(_id),
				status: true,
			},
		};
		const $lookup = {
			$lookup: {
				from: "countries",
				localField: "countryId",
				foreignField: "countryId",
				as: "countryData",
			},
		};
		const $unwind = {
			$unwind: { path: "$countryData", preserveNullAndEmptyArrays: true },
		};
		const $lookupb = {
			$lookup: {
				from: "states",
				localField: "stateId",
				foreignField: "stateId",
				as: "stateData",
			},
		};
		const $unwindb = {
			$unwind: { path: "$stateData", preserveNullAndEmptyArrays: true },
		};
		const $lookupc = {
			$lookup: {
				from: "cities",
				localField: "cityId",
				foreignField: "cityId",
				as: "cityData",
			},
		};
		const $unwindc = {
			$unwind: { path: "$cityData", preserveNullAndEmptyArrays: true },
		};
		const $lookupq = {
			$lookup: {
				from: "qualifications",
				localField: "_qualification",
				foreignField: "_id",
				as: "qualificationData",
			},
		};
		const $unwindq = {
			$unwind: {
				path: "$qualificationData",
				preserveNullAndEmptyArrays: true,
			},
		};
		const $lookupsq = {
			$lookup: {
				from: "subqualifications",
				localField: "_subQualification",
				foreignField: "_id",
				as: "subData",
			},
		};
		const $unwindsq = {
			$unwind: { path: "$subData", preserveNullAndEmptyArrays: true },
		};
		const $project = {
			$project: {
				_id: true,
				name: true,
				mobile: true,
				email: true,
				address: true,
				pincode: true,
				image: true,
				semester: true,
				cgpa: true,
				resume: true,
				session: true,
				interests: true,
				cgpaType: true,
				otherUrls: true,
				careerObjective: true,
				_skill: true,
				linkedInUrl: true,
				facebookUrl: true,
				twitterUrl: true,
				countryId: "$countryData._id",
				countryName: "$countryData.name",
				stateId: "$stateData._id",
				stateName: "$stateData.name",
				cityId: "$cityData._id",
				cityName: "$cityData.name",
				_qualification: "$qualificationData._id",
				_qualificationName: "$qualificationData.name",
				_subQualification: "$subData._id",
				_subQualificationName: "$subData.name",
			},
		};
		const candidate = await Candidate.aggregate([
			$match,
			$lookup,
			$unwind,
			$lookupb,
			$unwindb,
			$lookupc,
			$unwindc,
			$lookupq,
			$unwindq,
			$lookupsq,
			$unwindsq,
			$project,
		]);
		if (!candidate) throw req.ykError("Candidate not found!");
		return res.send({
			status: true,
			message: "Candidate data fetch successfully!",
			data: { candidate },
		});
	} catch (err) {
		return req.errFunc(err);
	}
};

module.exports.changeImage = async (req, res) => {
	try {
		const { image } = req.body;
		const { _id } = req.user;
		if (!image) throw req.ykError("Image is required!");
		const candidate = await Candidate.findByIdAndUpdate(
			_id,
			{ $set: { image } },
			{ new: true }
		).select("image");
		if (!candidate) throw req.ykError("profile image not updated now!");
		return res.send({
			status: true,
			message: "Candidate image change successfully!",
			data: { candidate },
		});
	} catch (err) {
		return req.errFunc(err);
	}
};

module.exports.changeMobile = async (req, res) => {
	try {
		const { mobile } = req.body;
		const { _id } = req.user;
		const candExist = await Candidate.findOne({ mobile, _id: { $ne: _id } });
		if (candExist) throw req.ykError("Mobile number already exist!");
		const candidate = await Candidate.findByIdAndUpdate(_id, mobile, {
			new: true,
		}).select("mobile");
		if (!candidate) throw req.ykError("Mobile number not updated now!");
		return res.send({
			status: true,
			message: "Candidate mobile number change successfully!",
			data: { candidate },
		});
	} catch (err) {
		return req.errFunc(err);
	}
};

module.exports.completeProfile = async (req, res) => {
	try {
		const { mobile } = req.body;
		const { _id } = req.user;
		const candExist = await Candidate.findOne({ mobile, _id: { $ne: _id } });
		if (candExist) throw req.ykError("Mobile number already exist!");
		const candidate = await Candidate.findByIdAndUpdate(
			_id,
			{ ...req.body },
			{ new: true }
		);
		if (!candidate) throw req.ykError("Candidate profile not updated now!");
		return res.send({
			status: true,
			message: "Candidate profile completed successfully!",
			data: { candidate },
		});
	} catch (err) {
		return req.errFunc(err);
	}
};

module.exports.getCareerObjective = async (req, res) => {
	try {
		let careerObj;
		const { careerObjective } = req.user;
		if (!careerObjective) {
			careerObj = "";
		} else {
			careerObj = careerObjective;
		}
		return res.send({
			status: true,
			message: "Candidate career objective get successfully!",
			data: { careerObjective: careerObj },
		});
	} catch (err) {
		return req.errFunc(err);
	}
};

module.exports.updateCareerObjective = async (req, res) => {
	try {
		const { _id } = req.user;
		const candidate = await Candidate.findByIdAndUpdate(
			_id,
			{ ...req.body },
			{ new: true }
		);
		if (!candidate) throw req.ykError("Candidate data not update now!");
		const { careerObjective } = candidate;
		return res.send({
			status: true,
			message: "Candidate career objective updated successfully!",
			data: { careerObjective },
		});
	} catch (err) {
		return req.errFunc(err);
	}
};

module.exports.getSkill = async (req, res) => {
	try {
		let skills;
		const { _skill } = req.user;
		if (!_skill) {
			skills = "";
		} else {
			skills = _skill;
		}
		return res.send({
			status: true,
			message: "Candidate skills data get successfully!",
			data: { skills },
		});
	} catch (err) {
		return req.errFunc(err);
	}
};

module.exports.updateSkill = async (req, res) => {
	try {
		const { _id } = req.user;
		const candidate = await Candidate.findByIdAndUpdate(
			_id,
			{ ...req.body },
			{ new: true }
		);
		if (!candidate) throw req.ykError("Candidate skill data not update now!");
		const { _skill } = candidate;
		return res.send({
			status: true,
			message: "Candidate skill updated successfully!",
			data: { _skill },
		});
	} catch (err) {
		return req.errFunc(err);
	}
};

module.exports.getInterest = async (req, res) => {
	try {
		let interest;
		const { interests } = req.user;
		if (!interests) {
			interest = "";
		} else {
			interest = interests;
		}
		return res.send({
			status: true,
			message: "Candidate interest data get successfully!",
			data: { interest },
		});
	} catch (err) {
		return req.errFunc(err);
	}
};

module.exports.updateInterest = async (req, res) => {
	try {
		const { _id } = req.user;
		const candidate = await Candidate.findByIdAndUpdate(
			_id,
			{ ...req.body },
			{ new: true }
		);
		if (!candidate)
			throw req.ykError("Candidate interest data not update now!");
		const { interests } = candidate;
		return res.send({
			status: true,
			message: "Candidate interests updated successfully!",
			data: { interests },
		});
	} catch (err) {
		return req.errFunc(err);
	}
};

module.exports.profileDetail = async (req, res) => {
	try {
		let contactDetail = false;
		let careerObj = false;
		let qualification = false;
		let candidateCarrer = false;
		let projects = false;
		let skillData = false;
		let interestData = false;
		let referenceData = false;
		const {
			_id,
			email,
			image,
			countryId,
			stateId,
			cityId,
			careerObjective,
			_skill,
			interests,
		} = req.user;

		if (email && countryId && stateId && cityId && image)
			contactDetail = true;
		if (careerObjective && careerObjective !== "") careerObj = true;
		if (_skill && _skill.length > 0) skillData = true;
		if (interests && interests.length > 0) interestData = true;
		const qua = await CandidateQualification.find({ _candidate: _id });
		if (qua && qua.length > 0) qualification = true;
		const career = await CandidateCareer.find({ _candidate: _id });
		if (career && career.length > 0) candidateCarrer = true;
		const proj = await CandidateProject.find({ _candidate: _id });
		if (proj && proj.length > 0) projects = true;
		const ref = await CandidateReference.find({ _candidate: _id });
		if (ref && ref.length > 0) referenceData = true;
		const data = {
			image,
			contactDetail,
			careerObj,
			qualification,
			candidateCarrer,
			projects,
			skillData,
			interestData,
			referenceData,
		};
		return res.send({
			status: true,
			message: "Candidate profile detail fetch successfully!",
			data,
		});
	} catch (err) {
		return req.errFunc(err);
	}
};

module.exports.genrateApplicationForm = async (req, res, next) => {
	try {
		const {id} =req.body
		const htmlContent = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Form 2025-26</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
            height: 297mm;
            width: 210mm;
            min-width: 210mm;
            min-height: 297mm;

        }
        
        .form-container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            border: 2px solid #ddd;
            padding: 5px;
        }
        
        .header {
            background-color: #4a5a8a;
            color: white;
            padding: 5px;
            font-weight: bold;
            font-size: 20px;
            position: relative;
        }
        
        .header-info {
            padding: 15px;
            border-bottom: 1px solid #ddd;
        }
        
        .header-info table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .header-info td {
            padding: 4px 0;
            font-size: 15px;
        }
        
        .header-info .label {
            font-weight: bold;
            width: 180px;
        }
        
        .logo {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
        }
        
        .logo img {
            height: 40px;
            width: auto;
        }
        
        .section-header {
            background-color: #4a5a8a;
            color: white;
            padding: 10px 15px;
            font-weight: bold;
            font-size: 14px;
            margin-top: 0;
        }
        
        .section-content {
            padding: 15px;
            position: relative;
        }
        
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        
        .details-table td {
            padding: 6px 5px;
            font-size: 12px;
            border-bottom: 1px solid #eee;
            vertical-align: top;
        }
        
        .details-table .label {
            font-weight: bold;
            width: 140px;
        }
        
        .details-table .value {
            padding-left: 10px;
        }
        
        .photo-section {
            position: absolute;
            right: 15px;
            top: 15px;
        }
        
        .photo-placeholder {
            width: 100px;
            height: 120px;
            border: 2px solid #ccc;
            background-color: #f9f9f9;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #666;
        }
        
        .photo-img {
            width: 100px;
            height: 120px;
            border: 2px solid #ccc;
            object-fit: cover;
        }
        
        .address-row {
            display: flex;
            gap: 30px;
        }
        
        .address-col {
            flex: 1;
        }
        
        .documents-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        .documents-table th,
        .documents-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            font-size: 12px;
        }
        
        .documents-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        
        .document-link {
            color: #0066cc;
            text-decoration: underline;
            font-size: 11px;
        }
        
        .declaration-content {
            font-size: 12px;
            line-height: 1.4;
            text-align: justify;
        }
        
        .signature-section {
            margin-top: 30px;
            text-align: right;
        }
        
        .signature-name {
            font-weight: bold;
            margin-top: 20px;
        }
        
        .clear {
            clear: both;
        }
        
        .personal-details-content {
            margin-right: 120px;
        }
        .div-1 , .div-2 {
            width:50%
        }
        .div-2{
            padding: 50px;
        }
        .section-1st{
            display: flex;
            align-items: center;
        }

        
    </style>
</head>
<body>
    <div class="form-container">
        <!-- Header -->
        <div class="section-1st">
            <div class="div-1">
                <!-- Header -->
                <div class="header">
                    APPLICATION FORM 2025-26

                </div>

                <!-- Header Information -->
                <div class="header-info">
                    <table>

                        <tr>
                            <td class="label">Project :</td>
                            <td>IM Shakti</td>
                        </tr>
                        <tr>
                            <td class="label">Course :</td>
                            <td>Master Gardener</td>
                        </tr>
                        <tr>
                            <td class="label">Application Form Number:</td>
                            <td>FOCALSKILLS/23/81970</td>
                        </tr>
                        <tr>
                            <td class="label">Branch:</td>
                            <td>FSD Ajmer Center</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="div-2">
            ${imgTag}

            </div>
        </div>
        
        <!-- Personal Details -->
        <div class="section-header">
            PERSONAL DETAILS
        </div>
        
        <div class="section-content">
            <div class="photo-section">
                <div class="photo-placeholder">
                    Photo
                </div>
            </div>
            
            <div class="personal-details-content">
                <table class="details-table">
                    <tr>
                        <td class="label">Full Name:</td>
                        <td class="value">Salma bano</td>
                    </tr>
                    <tr>
                        <td class="label">Email:</td>
                        <td class="value">kingshfaan588@gmail.com</td>
                    </tr>
                    <tr>
                        <td class="label">Mobile:</td>
                        <td class="value">917023637717</td>
                    </tr>
                    <tr>
                        <td class="label">Title:</td>
                        <td class="value">Miss.</td>
                    </tr>
                    <tr>
                        <td class="label">Date of Birth:</td>
                        <td class="value">10-Sep-1992</td>
                    </tr>
                    <tr>
                        <td class="label">Gender:</td>
                        <td class="value">Female</td>
                    </tr>
                </table>
            </div>
            
            <div class="clear"></div>
        </div>
        
        <!-- Permanent Address -->
        <div class="section-header">
            PERMANENT ADDRESS DETAILS
        </div>
        
        <div class="section-content">
            <div class="address-row">
                <div class="address-col">
                    <table class="details-table">
                        <tr>
                            <td class="label">Address Line 1:</td>
                            <td class="value">Ajaysar Village</td>
                        </tr>
                        <tr>
                            <td class="label">State:</td>
                            <td class="value">Rajasthan</td>
                        </tr>
                        <tr>
                            <td class="label">City:</td>
                            <td class="value">Ajmer</td>
                        </tr>
                    </table>
                </div>
                <div class="address-col">
                    <table class="details-table">
                        <tr>
                            <td class="label">Country:</td>
                            <td class="value">Domestic (Indian Resident)</td>
                        </tr>
                        <tr>
                            <td class="label">District:</td>
                            <td class="value">Ajmer</td>
                        </tr>
                        <tr>
                            <td class="label">Pincode:</td>
                            <td class="value">305005</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- Address for Correspondence -->
        <div class="section-header">
            ADDRESS FOR CORRESPONDENCE
        </div>
        
        <div class="section-content">
            <div class="address-row">
                <div class="address-col">
                    <table class="details-table">
                        <tr>
                            <td class="label">Address Line 1:</td>
                            <td class="value">Ajaysar Village</td>
                        </tr>
                        <tr>
                            <td class="label">State:</td>
                            <td class="value">Rajasthan</td>
                        </tr>
                        <tr>
                            <td class="label">City:</td>
                            <td class="value">Ajmer</td>
                        </tr>
                    </table>
                </div>
                <div class="address-col">
                    <table class="details-table">
                        <tr>
                            <td class="label">Country:</td>
                            <td class="value">Domestic (Indian Resident)</td>
                        </tr>
                        <tr>
                            <td class="label">District:</td>
                            <td class="value">Ajmer</td>
                        </tr>
                        <tr>
                            <td class="label">Pincode:</td>
                            <td class="value">305005</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        
       
        
        <!-- Documents Upload -->
        <div class="section-header">
            DOCUMENTS UPLOAD
        </div>
        
        <div class="section-content">
            <table class="documents-table">
                <thead>
                    <tr>
                        <th>Document Type</th>
                        <th>File Name</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Aadhar Card Front Side:</td>
                        <td><a href="#" class="document-link">FOCALSKILLS_23_81970_sulma1.jpg</a></td>
                        <td>Uploaded</td>
                    </tr>
                    <tr>
                        <td>10th Marksheet:</td>
                        <td><a href="#" class="document-link">FOCALSKILLS_23_81970_sulma10th.jpg</a></td>
                        <td>Uploaded</td>
                    </tr>
                    <tr>
                        <td>12th Marksheet:</td>
                        <td><a href="#" class="document-link">FOCALSKILLS_23_81970_sulma12th.jpg</a></td>
                        <td>Uploaded</td>
                    </tr>
                </tbody>
            </table>
        </div>
        

        
        <!-- Declaration -->
        <div class="section-header">
            DECLARATION
        </div>
        
        <div class="section-content">
            <div class="declaration-content">
                <p>I certify that the information submitted by me in support of this application, is true to the best of my knowledge and belief. I understand that in the event of any information being found false or incorrect, my admission is liable to be rejected / cancelled at any stage of the program. I undertake to abide by the disciplinary rules and regulations of Focal Skills Development.</p>
                
                <div class="signature-section">
                    <div class="signature-name">Salma bano</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
	
		const browser = await puppeteer.launch({
		  headless: true,
		  args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});
	
		const page = await browser.newPage();
		await page.setContent(htmlContent, { waitUntil: "networkidle0" });
	
		const pdfBuffer = await page.pdf({
		  format: "A4",
		  printBackground: true,
		});
	
		await browser.close();
	
		// Send PDF buffer as a downloadable file
		res.set({
		  "Content-Type": "application/pdf",
		  "Content-Disposition": `attachment; filename="application_form.pdf"`,
		  "Content-Length": pdfBuffer.length,
		});
	
		return res.send(pdfBuffer);
	
	  } catch (err) {
		console.error("PDF generation error:", err);
		res.status(500).send("Failed to generate PDF");
	  }
};
