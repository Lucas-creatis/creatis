from girder.api.rest import Resource, filtermodel
from girder import logger
from girder.api import access
from girder.api.describe import Description, autoDescribeRoute
from girder.constants import AccessType
from .models.pipeline import PipelineExecution as PipelineExecutionModel

class PipelineExecution(Resource):
    def __init__(self):
        super(PipelineExecution, self).__init__()
        self.resourceName = 'pipeline_execution'
        self.model = PipelineExecutionModel()

        self.route('GET', (), self.get)
        self.route('POST', (), self.createProcess)
        self.route('DELETE', (':id',), self.deleteProcess)

    @access.public
    @autoDescribeRoute(
	Description("Get all process")
    )
    def get(self):
        list = []
        for pipeline in self.model.get():
            list.append(pipeline)

        return list

    @access.public
    @autoDescribeRoute(
    Description("Insert new execution of pipeline")
    .param('name', 'Name of execution')
    )
    def createProcess(self, params):
        return self.model.createProcess(name=params['name'].strip())

    # Ajouter dans modelParam un argument level=AccessType.ADMIN
    # Pour controller les acces, etendre le model a AccessControlledModel
    @access.public
    @autoDescribeRoute(
    Description("Insert new execution of pipeline")
    .modelParam('id', 'The ID of the execution to delete', model=PipelineExecutionModel,
    destName='pipelineExecution')
    )
    def deleteProcess(self, pipelineExecution):
        self.model.remove(pipelineExecution)
        #logger.info(params)
        return {'message': 'Deleted execution %s.' % pipelineExecution['name']}
