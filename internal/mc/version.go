package mc

type VersionManager struct {
}

func NewVersionManager() *VersionManager {
	return &VersionManager{}
}

func (v *VersionManager) FetchVanillaVersions() {}
