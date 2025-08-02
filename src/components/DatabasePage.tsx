'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import useAppStore from '@/stores/appStore'
import { apiMethods } from '@/lib/api'
import toast from 'react-hot-toast'
import { formatDate, truncateText } from '@/lib/utils'
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'

const DatabasePage: React.FC = () => {
  const {
    cvs,
    jobDescriptions,
    setCVs,
    setJobDescriptions,
    removeCV,
    removeJobDescription,
    setLoading,
    currentTab
  } = useAppStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasLoadedData, setHasLoadedData] = useState(false)
  const [showedToast, setShowedToast] = useState(false)

  const loadData = useCallback(async () => {
    if (hasLoadedData) return
    
    console.log('📂 Loading database data...')
    setLoading(true)
    setIsRefreshing(true)

    try {
      const [cvsResponse, jdsResponse] = await Promise.all([
        apiMethods.listCVs(),
        apiMethods.listJDs()
      ])

      console.log('✅ Data loaded:', { 
        cvs: cvsResponse.cvs.length, 
        jds: jdsResponse.jds.length 
      })

      setCVs(cvsResponse.cvs || [])
      setJobDescriptions(jdsResponse.jds || [])
      setHasLoadedData(true)

      if (!showedToast) {
        toast.success(`Loaded ${cvsResponse.cvs.length} CVs and ${jdsResponse.jds.length} JDs`)
        setShowedToast(true)
      }
    } catch (error) {
      console.error('❌ Failed to load data:', error)
      toast.error('Failed to load database data')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [hasLoadedData, setCVs, setJobDescriptions, setLoading, showedToast])

  useEffect(() => {
    if (currentTab === 'database') {
      loadData()
    }
  }, [currentTab, loadData]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (type: 'cv' | 'jd', id: string) => {
    try {
      if (type === 'cv') {
        await apiMethods.deleteCV(id)
        removeCV(id)
        toast.success('CV deleted successfully')
      } else {
        await apiMethods.deleteJD(id)
        removeJobDescription(id)
        toast.success('Job Description deleted successfully')
      }
    } catch (error) {
      console.error('❌ Delete failed:', error)
      toast.error(`Failed to delete ${type === 'cv' ? 'CV' : 'Job Description'}`)
    }
  }

  const filteredCVs = cvs.filter(cv =>
    cv.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cv.content?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredJDs = jobDescriptions.filter(jd =>
    jd.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    jd.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    jd.company?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            id="search-database"
            name="search-database"
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
            aria-label="Search database"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setHasLoadedData(false)
            loadData()
          }}
          leftIcon={<ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
          disabled={isRefreshing}
        >
          Refresh
        </Button>
      </div>

      {/* CVs Section */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stored CVs</CardTitle>
              <CardDescription>
                {filteredCVs.length} CV{filteredCVs.length !== 1 ? 's' : ''} in database
              </CardDescription>
            </div>
            <Badge variant="default">{filteredCVs.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCVs.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 mx-auto text-secondary-400 mb-3" />
              <p className="text-secondary-600">No CVs found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCVs.map((cv) => (
                <div
                  key={cv.id}
                  className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <DocumentTextIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">
                        {cv.filename}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {formatDate(cv.upload_date)} • {cv.file_size ? `${Math.round(cv.file_size / 1024)}KB` : 'Unknown size'}
                      </p>
                      {cv.extracted_text && (
                        <p className="text-xs text-secondary-600 mt-1">
                          {truncateText(cv.extracted_text, 100)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete('cv', cv.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Descriptions Section */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Job Descriptions</CardTitle>
              <CardDescription>
                {filteredJDs.length} Job Description{filteredJDs.length !== 1 ? 's' : ''} in database
              </CardDescription>
            </div>
            <Badge variant="default">{filteredJDs.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredJDs.length === 0 ? (
            <div className="text-center py-8">
              <DocumentDuplicateIcon className="h-12 w-12 mx-auto text-secondary-400 mb-3" />
              <p className="text-secondary-600">No job descriptions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJDs.map((jd) => (
                <div
                  key={jd.id}
                  className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <DocumentDuplicateIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">
                        {jd.title || 'Untitled Position'}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {jd.company && `${jd.company} • `}
                        {jd.location && `${jd.location} • `}
                        {formatDate(jd.created_date)}
                      </p>
                      {jd.content && (
                        <p className="text-xs text-secondary-600 mt-1">
                          {truncateText(jd.content, 100)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete('jd', jd.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DatabasePage