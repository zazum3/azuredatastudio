/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SummaryPage } from '../../../wizard/pages/summaryPage';
import { ApiWrapper } from '../../../common/apiWrapper';
import { FlatFileWizard } from '../../../wizard/flatFileWizard';
import * as TypeMoq from 'typemoq';
import { ImportDataModel } from '../../../wizard/api/models';
import { TestImportDataModel, TestModelView, TestModelBuilder } from '../../utils.test';
import * as azdata from 'azdata';
import * as should from 'should';

describe('Summary Page tests', function () {

	let mockFlatFileWizard: TypeMoq.IMock<FlatFileWizard>;
	let mockApiWrapper: TypeMoq.IMock<ApiWrapper>;
	let mockImportModel: TypeMoq.IMock<ImportDataModel>;
	let mockImportView: TypeMoq.IMock<azdata.ModelView>;
	let mockModelBuilder: TypeMoq.IMock<azdata.ModelBuilder>;

	beforeEach(function () {
		mockApiWrapper = TypeMoq.Mock.ofType(ApiWrapper);
		mockFlatFileWizard = TypeMoq.Mock.ofType(FlatFileWizard, TypeMoq.MockBehavior.Loose, undefined, TypeMoq.It.isAny(), mockApiWrapper.object);
		mockImportModel = TypeMoq.Mock.ofType(TestImportDataModel, TypeMoq.MockBehavior.Loose);
		mockImportView = TypeMoq.Mock.ofType(TestModelView, TypeMoq.MockBehavior.Loose);
		mockModelBuilder = TypeMoq.Mock.ofType(TestModelBuilder, TypeMoq.MockBehavior.Loose);
	});

	it('should create view components successfully', async function () {
		mockImportView.setup(x => x.modelBuilder).returns(function () { return mockModelBuilder.object; });
		let summaryPage = new SummaryPage(mockFlatFileWizard.object, TypeMoq.It.isAny(), mockImportModel.object, mockImportView.object, TypeMoq.It.isAny(), mockApiWrapper.object);
		await summaryPage.start();
		should.notEqual(summaryPage.table, undefined);
		should.notEqual(summaryPage.statusText, undefined);
		should.notEqual(summaryPage.loading, undefined);
		should.notEqual(summaryPage.form, undefined);
	});
});
