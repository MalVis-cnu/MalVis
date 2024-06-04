import argparse
import json

import similarity
import clustering
import error

API_NAME = ['NtOpenThread', 'ExitWindowsEx', 'FindResourceW', 'CryptExportKey', 'CreateRemoteThreadEx', 'MessageBoxTimeoutW', 'InternetCrackUrlW', 'StartServiceW', 'GetFileSize', 'GetVolumeNameForVolumeMountPointW', 'GetFileInformationByHandle', 'CryptAcquireContextW', 'RtlDecompressBuffer', 'SetWindowsHookExA', 'RegSetValueExW', 'LookupAccountSidW', 'SetUnhandledExceptionFilter', 'InternetConnectA', 'GetComputerNameW', 'RegEnumValueA', 'NtOpenFile', 'NtSaveKeyEx', 'HttpOpenRequestA', 'recv', 'GetFileSizeEx', 'LoadStringW', 'SetInformationJobObject', 'WSAConnect', 'CryptDecrypt', 'GetTimeZoneInformation', 'InternetOpenW', 'CoInitializeEx', 'CryptGenKey', 'GetAsyncKeyState', 'NtQueryInformationFile', 'GetSystemMetrics', 'NtDeleteValueKey', 'NtOpenKeyEx', 'sendto', 'IsDebuggerPresent', 'RegQueryInfoKeyW', 'NetShareEnum', 'InternetOpenUrlW', 'WSASocketA', 'CopyFileExW', 'connect', 'ShellExecuteExW', 'SearchPathW', 'GetUserNameA', 'InternetOpenUrlA', 'LdrUnloadDll', 'EnumServicesStatusW', 'EnumServicesStatusA', 'WSASend', 'CopyFileW', 'NtDeleteFile', 'CreateActCtxW', 'timeGetTime', 'MessageBoxTimeoutA', 'CreateServiceA', 'FindResourceExW', 'WSAAccept', 'InternetConnectW', 'HttpSendRequestA', 'GetVolumePathNameW', 'RegCloseKey', 'InternetGetConnectedStateExW', 'GetAdaptersInfo', 'shutdown', 'NtQueryMultipleValueKey', 'NtQueryKey', 'GetSystemWindowsDirectoryW', 'GlobalMemoryStatusEx', 'GetFileAttributesExW', 'OpenServiceW', 'getsockname', 'LoadStringA', 'UnhookWindowsHookEx', 'NtCreateUserProcess', 'Process32NextW', 'CreateThread', 'LoadResource', 'GetSystemTimeAsFileTime', 'SetStdHandle', 'CoCreateInstanceEx', 'GetSystemDirectoryA', 'NtCreateMutant', 'RegCreateKeyExW', 'IWbemServices_ExecQuery', 'NtDuplicateObject', 'Thread32First', 'OpenSCManagerW', 'CreateServiceW', 'GetFileType', 'MoveFileWithProgressW', 'NtDeviceIoControlFile', 'GetFileInformationByHandleEx', 'CopyFileA', 'NtLoadKey', 'GetNativeSystemInfo', 'NtOpenProcess', 'CryptUnprotectMemory', 'InternetWriteFile', 'ReadProcessMemory', 'gethostbyname', 'WSASendTo', 'NtOpenSection', 'listen', 'WSAStartup', 'socket', 'OleInitialize', 'FindResourceA', 'RegOpenKeyExA', 'RegEnumKeyExA', 'NtQueryDirectoryFile', 'CertOpenSystemStoreW', 'ControlService', 'LdrGetProcedureAddress', 'GlobalMemoryStatus', 'NtSetInformationFile', 'OutputDebugStringA', 'GetAdaptersAddresses', 'CoInitializeSecurity', 'RegQueryValueExA', 'NtQueryFullAttributesFile', 'DeviceIoControl', '__anomaly__', 'DeleteFileW', 'GetShortPathNameW', 'NtGetContextThread', 'GetKeyboardState', 'RemoveDirectoryA', 'InternetSetStatusCallback', 'NtResumeThread', 'SetFileInformationByHandle', 'NtCreateSection', 'NtQueueApcThread', 'accept', 'DecryptMessage', 'GetUserNameExW', 'SizeofResource', 'RegQueryValueExW', 'SetWindowsHookExW', 'HttpOpenRequestW', 'CreateDirectoryW', 'InternetOpenA', 'GetFileVersionInfoExW', 'FindWindowA', 'closesocket', 'RtlAddVectoredExceptionHandler', 'IWbemServices_ExecMethod', 'GetDiskFreeSpaceExW', 'TaskDialog', 'WriteConsoleW', 'CryptEncrypt', 'WSARecvFrom', 'NtOpenMutant', 'CoGetClassObject', 'NtQueryValueKey', 'NtDelayExecution', 'select', 'HttpQueryInfoA', 'GetVolumePathNamesForVolumeNameW', 'RegDeleteValueW', 'InternetCrackUrlA', 'OpenServiceA', 'InternetSetOptionA', 'CreateDirectoryExW', 'bind', 'NtShutdownSystem', 'DeleteUrlCacheEntryA', 'NtMapViewOfSection', 'LdrGetDllHandle', 'NtCreateKey', 'GetKeyState', 'CreateRemoteThread', 'NtEnumerateValueKey', 'SetFileAttributesW', 'NtUnmapViewOfSection', 'RegDeleteValueA', 'CreateJobObjectW', 'send', 'NtDeleteKey', 'SetEndOfFile', 'GetUserNameExA', 'GetComputerNameA', 'URLDownloadToFileW', 'NtFreeVirtualMemory', 'recvfrom', 'NtUnloadDriver', 'NtTerminateThread', 'CryptUnprotectData', 'NtCreateThreadEx', 'DeleteService', 'GetFileAttributesW', 'GetFileVersionInfoSizeExW', 'OpenSCManagerA', 'WriteProcessMemory', 'GetSystemInfo', 'SetFilePointer', 'Module32FirstW', 'ioctlsocket', 'RegEnumKeyW', 'RtlCompressBuffer', 'SendNotifyMessageW', 'GetAddrInfoW', 'CryptProtectData', 'Thread32Next', 'NtAllocateVirtualMemory', 'RegEnumKeyExW', 'RegSetValueExA', 'DrawTextExA', 'CreateToolhelp32Snapshot', 'FindWindowW', 'CoUninitialize', 'NtClose', 'WSARecv', 'CertOpenStore', 'InternetGetConnectedState', 'RtlAddVectoredContinueHandler', 'RegDeleteKeyW', 'SHGetSpecialFolderLocation', 'CreateProcessInternalW', 'NtCreateDirectoryObject', 'EnumWindows', 'DrawTextExW', 'RegEnumValueW', 'SendNotifyMessageA', 'NtProtectVirtualMemory', 'NetUserGetLocalGroups', 'GetUserNameW', 'WSASocketW', 'getaddrinfo', 'AssignProcessToJobObject', 'SetFileTime', 'WriteConsoleA', 'CryptDecodeObjectEx', 'EncryptMessage', 'system', 'NtSetContextThread', 'LdrLoadDll', 'InternetGetConnectedStateExA', 'RtlCreateUserThread', 'GetCursorPos', 'Module32NextW', 'RegCreateKeyExA', 'NtLoadDriver', 'NetUserGetInfo', 'SHGetFolderPathW', 'GetBestInterfaceEx', 'CertControlStore', 'StartServiceA', 'NtWriteFile', 'Process32FirstW', 'NtReadVirtualMemory', 'GetDiskFreeSpaceW', 'GetFileVersionInfoW', 'FindFirstFileExW', 'FindWindowExW', 'GetSystemWindowsDirectoryA', 'RegOpenKeyExW', 'CoCreateInstance', 'NtQuerySystemInformation', 'LookupPrivilegeValueW', 'NtReadFile', 'ReadCabinetState', 'GetForegroundWindow', 'InternetCloseHandle', 'FindWindowExA', 'ObtainUserAgentString', 'CryptCreateHash', 'GetTempPathW', 'CryptProtectMemory', 'NetGetJoinInformation', 'NtOpenKey', 'GetSystemDirectoryW', 'DnsQuery_A', 'RegQueryInfoKeyA', 'NtEnumerateKey', 'RegisterHotKey', 'RemoveDirectoryW', 'FindFirstFileExA', 'CertOpenSystemStoreA', 'NtTerminateProcess', 'NtSetValueKey', 'CryptAcquireContextA', 'SetErrorMode', 'UuidCreate', 'RtlRemoveVectoredExceptionHandler', 'RegDeleteKeyA', 'setsockopt', 'FindResourceExA', 'NtSuspendThread', 'GetFileVersionInfoSizeW', 'NtOpenDirectoryObject', 'InternetQueryOptionA', 'InternetReadFile', 'NtCreateFile', 'NtQueryAttributesFile', 'HttpSendRequestW', 'CryptHashMessage', 'CryptHashData', 'NtWriteVirtualMemory', 'SetFilePointerEx', 'CertCreateCertificateContext', 'DeleteUrlCacheEntryW', '__exception__']
DEBUG = True

def args_parsing():
    parser = argparse.ArgumentParser(formatter_class=argparse.RawTextHelpFormatter, add_help=True)


    parser.add_argument('-i', dest='input_data', action='store',
                        help='input file path')
    
    parser.add_argument('--similarity-method', action='store',
                        help=f'select similarity method {list(similarity.valid_similarity_methods.keys())}')
    parser.add_argument('--similarity-option', action='append', nargs='*',
                        help='input similarity options [option_name option_value]*\n' +
                        'jaccard:\n' +
                        '\tngram [int]\n' +
                        'cosine:\n' +
                        '\tngram [int]\n')
    
    parser.add_argument('--clustering-method', action='store',
                        help=f'select clustering method {list(clustering.valid_clustering_methods.keys())}')
    parser.add_argument('--clustering-option', action='append', nargs='*',
                        help='input clustering options [option_name option_value]*\n' +
                        'hierarchical:\n' +
                        '\tn_cluster [int]\n' +
                        '\tdistance_threshold [int]\n' +
                        '\tlinkage [single, complete, average]\n'
                        'kmeans:\n' +
                        '\tk [int]\n' +
                        '\tmax_iteration [int]\n')
    try:
        return parser.parse_args()
    except:
        error.print_and_exit(1, 'cannot parse input arguments')


def input_data_parsing(input_data):
    global API_NAME
    data = []
    hash = []

    try:
        f = open(input_data)
    except:
        error.print_and_exit(2, 'cannot open file')

    line = f.readline()
    while True:
        line = f.readline()
        if not line:
            break

        line = line.split(',')
        if len(line) < 3:
            error.print_and_exit(3, 'not enough sequence data column')

        try:
            tmp = []
            for i in range(1, len(line)-1):
                if line[i] == '':
                    break
                else:
                    tmp.append( API_NAME[int(line[i])] + f'({line[i]})' )
            data.append(tmp)
        except:
            error.print_and_exit(4, f'{line} data is not API sequence number')

        hash.append(line[0])

    if len(hash) < 2:
        error.print_and_exit(5, 'not enough sequence data row')

    f.close()

    return data, hash


def option_parsing(option):
    if option:
        option = option[0]
        return {option[i]: option[i+1] for i in range(0,len(option),2)}


def main(args):
    input_data, hash = input_data_parsing(args.input_data)

    similarity_method = args.similarity_method
    clustering_method = args.clustering_method
        
    distance_matrix, similar_sequence_matrix = similarity.get_similarity(input_data=input_data, similarity_method=similarity_method, option=option_parsing(args.similarity_option))
    
    clustering_result = clustering.do_clustering(distance_matrix=distance_matrix, clustering_method=clustering_method, option=option_parsing(args.clustering_option))

    
    clustering_result['distance_matrix'] = distance_matrix
    clustering_result['hash'] = hash
    clustering_result['sequence_data'] = input_data
    clustering_result['similar_sequence_matrix'] = similar_sequence_matrix
    clustering_result['option'] = {
        'similarity_method' : args.similarity_method,
        'similarity_option' : option_parsing(args.similarity_option),
        'clustering_method' : args.clustering_method,
        'clustering_option' : option_parsing(args.clustering_option)
    }

    
    # for i in clustering_result.items(): print(i)
    print(json.dumps(clustering_result))



if __name__== '__main__':
    args = args_parsing()

    main(args)
