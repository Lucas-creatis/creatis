// Import utilities
import _ from 'underscore';
import 'girder/utilities/jquery/girderModal';
import { restRequest } from 'girder/rest';
import events from 'girder/events';

// Import views
import View from 'girder/views/View';

// Import about Creatis
import ConfirmPipelineDialogTemplate from '../templates/confirmPipelineDialog.pug';

function getTimestamp () {
    return (Math.round((new Date()).getTime() / 1000));
}

function checkError (data) {
    if (typeof data.errorCode !== 'undefined') {
	events.trigger('g:alert', {
	    text: data.errorMessage,
	    type: "danger",
	    duration: 3000
        });
	return 1;
    }
    return 0;
}

// Liste les applications de VIP accessibles par l'utilisateur
var ConfirmPipelineDialog = View.extend({

    initialize: function (settings) {
	this.file = settings.file;
	this.currentPipeline = settings.pipeline;
	this.foldersCollection = settings.foldersCollection;
	this.carmin = settings.carmin;
	this.pathVIP = "vip/Home/Girder/";
	console.log(this);
	// Trie le tableau foldersCollection en fonction de "path"
	this.foldersCollection.sort(function(a, b){
	    return a.path.localeCompare(b.path)
	});

	this.render();
    },

    events: {
	'submit .creatis-launch-pipeline-form' : 'initPipeline'
    },

    render: function () {
	$('#g-dialog-container').html(ConfirmPipelineDialogTemplate({
	    pipeline: this.currentPipeline,
	    file: this.file,
	    folders: this.foldersCollection
	})).girderModal(this);

	return this;
    },

    initPipeline: function (e) {
	e.preventDefault();
	var folderPath = this.pathVIP + "process-" + getTimestamp();

	console.log("Check folder Girder");
	// Check if Girder folder exists
	this.carmin.fileExists(this.pathVIP, function (data) {
	    if (!data.exists) {
		console.log("Doesn't exist");
		console.log("Create folder Girder/");
		this.carmin.createFolder(this.pathVIP, function (data) {
		    if (!checkError(data)) {
			console.log("OK");
			this.sendFile(folderPath);

		    }
		}.bind(this));
	    } else {
		console.log("Exist");
		this.sendFile(folderPath);
	    }
	}.bind(this));

	// TODO : Mettre en base de donnée
	// - le nom du dossier process qui fait office d'id unique
	// - le nom de l'execution
	// - le path de destination (girder)
	// - statut de l'execution
    },

    sendFile: function (folderPath) {
        // Create folder to this process
	console.log("Create folder process-xxxxxx/");
        this.carmin.createFolder(folderPath, function (data) {
            if (!checkError(data)) {
		console.log("OK");
                // Send file into folder
		console.log("Send file");
                this.carmin.uploadData(folderPath + "/" + this.file.name, this.file.data, function (data) {
                    if (!checkError(data)) {
                        console.log("OK");
			this.launchPipeline(folderPath);
		    }
                }.bind(this));
            }
        }.bind(this));
    },

    launchPipeline: function (folderPath) {
	this.form = this.$el[0].firstChild.firstChild.firstChild;
	var nameExecution = this.form[0].value;
	var folderGirderDestination = this.form[1].value;
	var sendEmail = this.form[2].checked;
	var pathFileVIP = folderPath + "/" + this.file.name;
	var inputs = {
	    'results-directory': folderPath,
	    'T1_file': '/vip/Home/Girder/process-1524229750/control1_3DT1.nii',
	    'out_folder': 'results',
	    'reference_image': '/grid/biomed/creatis/vip/data/groups/CAD_Neuro/data/image_ID.nii',
	    'smoothing_option': false,
	    'FWHM_number': 8
	};

	this.carmin.initAndStart(nameExecution, this.currentPipeline.identifier, inputs, function (data) {
	    console.log(data);
	});
    }

});

export default ConfirmPipelineDialog;
