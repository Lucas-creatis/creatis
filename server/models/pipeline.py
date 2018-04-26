#!/usr/bin/env python
# -*- coding: utf-8 -*-

from girder.models.model_base import Model
from girder.constants import AccessType

class PipelineExecution(Model):
    def initialize(self):
        self.name = 'pipeline_execution'
        self.ensureIndices(('name'))

        '''
        self.ensureTextIndex({
        'name': 10,
        })

        self.exposeFields(level=AccessType.READ, fields={
        '_id', 'name'
        })
        '''

    def validate(self, PipelineExecution):
        return PipelineExecution

    def get(self):
        for pipeline in self.find():
            yield pipeline

    def createProcess(self, name):
        pipeline = {
            'name': name
        }

        return self.save(pipeline)

    def remove(self, doc):
        super(PipelineExecution, self).remove(doc)
